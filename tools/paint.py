"""Generate the painted art with Qwen Image 2.1 Turbo on a ComfyUI server, then trim and convert it.

  python3 tools/paint.py                 # everything missing
  python3 tools/paint.py creature        # one group (creature, battle, title, portrait, sprite, building, prop)
  python3 tools/paint.py mon/tane --redo # specific files (substring match), regenerating even if present
  python3 tools/paint.py --convert       # only re-run the trim/convert step on existing raws

Raw PNGs go to art_raw/ (kept out of the site); finished WebP files go to img/. Prompts come from
tools/painted_prompts.json (node tools/gen_art_prompts.mjs). Set COMFY to override the server.
"""
import json, os, re, sys, time, random, uuid, urllib.request, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = os.environ.get('COMFY', 'http://chrisofficepc.tailbe865.ts.net:8189')
RAW = os.path.join(ROOT, 'art_raw')
SIGMAS = '1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0'

# Generation canvas per aspect (multiples of 32, about 1 MP) and the shipped size (long edge).
CANVAS = {'1:1': (1024, 1024), '16:9': (1376, 768), '2:1': (1440, 720), '3:4': (896, 1184)}
SHIP = {'creature': 512, 'battle': 1600, 'title': 1600, 'portrait': 384, 'sprite': 256, 'walk': 256, 'building': 768, 'prop': 384, 'room': 1600}


def canvas_for(aspect):
    if aspect in CANVAS:
        return CANVAS[aspect]
    w, h = (int(x) for x in aspect.split(':'))
    scale = (1024 * 1024 / (w * h)) ** 0.5
    return (round(w * scale / 32) * 32, round(h * scale / 32) * 32)


def call(path, body=None):
    req = urllib.request.Request(HOST + path, data=json.dumps(body).encode() if body else None,
                                 headers={'Content-Type': 'application/json'} if body else {})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def upload(raw):
    """Send a raw image (flattened onto white) to ComfyUI's input folder as an edit reference; returns its name."""
    im = Image.open(raw).convert('RGBA')
    flat = Image.new('RGBA', im.size, (255, 255, 255, 255))
    flat.alpha_composite(im)
    path = os.path.join(RAW, 'ref.png')
    flat.convert('RGB').save(path)
    boundary, name = uuid.uuid4().hex, 'kanamon_' + os.path.basename(raw)
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{name}"\r\nContent-Type: image/png\r\n\r\n'.encode()
            + open(path, 'rb').read() + f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{boundary}--\r\n'.encode())
    req = urllib.request.Request(HOST + '/upload/image', data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())['name']


def workflow(prompt, w, h, seed, ref=None):
    wf = {
        '1': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'qwen_image_2.1_turbo_int8_convrot.safetensors', 'weight_dtype': 'default'}},
        '2': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen3vl_8b_int8_convrot.safetensors', 'type': 'qwen_image', 'device': 'default'}},
        '3': {'class_type': 'VAELoader', 'inputs': {'vae_name': 'qwen_image_2.1_vae_bf16.safetensors'}},
        '4': {'class_type': 'TextEncodeQwenImage21', 'inputs': {'clip': ['2', 0], 'prompt': prompt, 'negative_prompt': '', 'resolution': 1024}},
        '5': {'class_type': 'EmptyLatentImage', 'inputs': {'width': w, 'height': h, 'batch_size': 1}},
        '6': {'class_type': 'QwenImage21Cache', 'inputs': {'model': ['1', 0], 'device': 'auto', 'dtype': 'default'}},
        '7': {'class_type': 'CFGGuider', 'inputs': {'model': ['6', 0], 'positive': ['4', 0], 'negative': ['4', 1], 'cfg': 1}},
        '8': {'class_type': 'KSamplerSelect', 'inputs': {'sampler_name': 'euler'}},
        '9': {'class_type': 'ManualSigmas', 'inputs': {'sigmas': SIGMAS}},
        '10': {'class_type': 'RandomNoise', 'inputs': {'noise_seed': seed}},
        '11': {'class_type': 'SamplerCustomAdvanced', 'inputs': {'noise': ['10', 0], 'guider': ['7', 0], 'sampler': ['8', 0], 'sigmas': ['9', 0], 'latent_image': ['5', 0]}},
        '12': {'class_type': 'VAEDecode', 'inputs': {'samples': ['11', 0], 'vae': ['3', 0]}},
        '13': {'class_type': 'SaveImage', 'inputs': {'images': ['12', 0], 'filename_prefix': 'kanamon/km'}},
    }
    if ref:  # image edit: the reference is <image1> in the prompt
        wf['r1'] = {'class_type': 'LoadImage', 'inputs': {'image': ref}}
        wf['4']['inputs'].update({'images.image_1': ['r1', 0], 'vae': ['3', 0]})
    return wf


def generate(entry, dest):
    prompt = entry['prompt']
    if entry.get('rgba'):
        prompt = f'This is an RGBA format image with transparency. {prompt} The image has an alpha channel and a transparent background.'
    w, h = canvas_for(entry['aspect'])
    ref = None
    if entry.get('ref'):
        ref_raw = os.path.join(RAW, os.path.splitext(entry['ref'])[0] + '.png')
        w, h = Image.open(ref_raw).size
        ref = upload(ref_raw)
    seed = entry.get('seed') or random.randint(1, 2**48)
    pid = json.loads(call('/prompt', {'prompt': workflow(prompt, w, h, seed, ref), 'client_id': 'kanamon'}))['prompt_id']
    while True:
        hist = json.loads(call(f'/history/{pid}'))
        if pid in hist:
            e = hist[pid]
            if e.get('status', {}).get('status_str') == 'error':
                raise RuntimeError(json.dumps(e['status'])[:600])
            imgs = [i for o in e.get('outputs', {}).values() for i in o.get('images', [])]
            if imgs:
                q = urllib.parse.urlencode({'filename': imgs[0]['filename'], 'subfolder': imgs[0].get('subfolder', ''), 'type': 'output'})
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, 'wb') as f:
                    f.write(call('/view?' + q))
                return seed
        time.sleep(1.5)


def alpha_clean(raw):
    im = Image.open(raw).convert('RGBA')
    im.putalpha(im.getchannel('A').point(lambda v: 0 if v < 12 else v))  # drop faint halo noise
    return im


def set_box(raw):
    """A sprite and its walk frames are cropped to one shared box so the frames line up when animated."""
    base = re.sub(r'_walk\d+(?=\.png$)', '', raw)
    members = [base] + [base[:-4] + f'_walk{i}.png' for i in (0, 1, 2)]
    boxes = [alpha_clean(f).getchannel('A').getbbox() for f in members if os.path.exists(f)]
    boxes = [b for b in boxes if b]
    return (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)) if boxes else None


def convert(entry, raw):
    group = entry['group']
    out = os.path.join(ROOT, os.path.splitext(entry['file'])[0] + '.webp')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(raw)
    if entry.get('rgba'):
        im = alpha_clean(raw)
        box = set_box(raw) if group in ('sprite', 'walk') else im.getchannel('A').getbbox()
        if box:
            im = im.crop(box)
        # pad to a square-ish frame for creatures/props so sizes stay consistent in the UI
        if group in ('creature', 'prop', 'portrait'):
            side = int(max(im.size) * 1.06)
            frame = Image.new('RGBA', (side, side), (0, 0, 0, 0))
            frame.paste(im, ((side - im.width) // 2, side - im.height - int(side * 0.03) if group != 'portrait' else (side - im.height) // 2))
            im = frame
    else:
        im = im.convert('RGB')
    long = SHIP[group]
    scale = long / max(im.size)
    if scale < 1:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    im.save(out, 'WEBP', quality=86 if not entry.get('rgba') else 90, method=6)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    redo, only_convert = '--redo' in sys.argv, '--convert' in sys.argv
    entries = json.load(open(os.path.join(ROOT, 'tools/painted_prompts.json')))
    seeds_path = os.path.join(RAW, 'seeds.json')
    seeds = json.load(open(seeds_path)) if os.path.exists(seeds_path) else {}
    groups = {e['group'] for e in entries}
    pick = [e for e in entries if not args or any(a == e['group'] or (a not in groups and a in e['file']) for a in args)]
    done = 0
    t0 = time.time()
    for i, e in enumerate(pick, 1):
        raw = os.path.join(RAW, os.path.splitext(e['file'])[0] + '.png')
        try:
            if not only_convert and (redo or not os.path.exists(raw)):
                t = time.time()
                if e['file'] in seeds and not redo:
                    e['seed'] = seeds[e['file']]
                seeds[e['file']] = generate(e, raw)
                json.dump(seeds, open(seeds_path, 'w'), indent=0)
                print(f'[{i}/{len(pick)}] {e["file"]} {time.time() - t:.0f}s', flush=True)
            if os.path.exists(raw):
                convert(e, raw)
                done += 1
        except Exception as ex:  # keep going; failures are listed and can be re-run
            print(f'[{i}/{len(pick)}] FAILED {e["file"]}: {ex}', flush=True)
    print(f'done {done}/{len(pick)} in {(time.time() - t0) / 60:.1f} min', flush=True)


if __name__ == '__main__':
    main()
