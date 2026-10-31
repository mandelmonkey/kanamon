#!/usr/bin/env python3
"""Split one batched TTS recording into individual clips.

usage: split_batch.py BATCH.json RECORDING.mp3 [--dry]
BATCH.json is a list of {"file": ..., "text": ...} in the order they were spoken.
Finds exactly len(BATCH) speech segments by trying several silence lengths, then writes
peak-normalised mono mp3s into ../audio/. Exits 2 if it cannot find the right count.
"""
import json, subprocess, sys, re, os

AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audio')

def duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())

def segments(path, noise, d):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', f'silencedetect=noise={noise}dB:d={d}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    total = duration(path)
    sil = []
    for i, s in enumerate(starts):
        sil.append((s, ends[i] if i < len(ends) else total))
    segs, cur = [], 0.0
    for s, e in sil:
        if s - cur > 0.08: segs.append((cur, s))
        cur = e
    if total - cur > 0.08: segs.append((cur, total))
    return segs

def main():
    batch = json.load(open(sys.argv[1]))
    rec = sys.argv[2]
    n = len(batch)
    found = None
    for noise in (-38, -42, -34):
        for d in (0.7, 0.8, 0.6, 0.9, 1.0, 0.5, 1.2, 0.45, 0.4, 0.35, 1.4):
            segs = segments(rec, noise, d)
            if len(segs) == n:
                found = segs; break
        if found: break
    if not found:
        print(f'FAIL: could not find {n} segments in {rec} (last try gave {len(segs)})')
        sys.exit(2)
    if '--dry' in sys.argv:
        for (s, e), item in zip(found, batch): print(f'{s:7.2f}-{e:7.2f} {e-s:5.2f}s {item["text"]}')
        return
    os.makedirs(AUDIO, exist_ok=True)
    for (s, e), item in zip(found, batch):
        out = os.path.join(AUDIO, item['file'])
        a, b = max(0, s - 0.06), e + 0.14
        tmp = out + '.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', rec, '-ac', '1', '-ar', '44100',
                        '-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse', tmp], check=True)
        vol = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        m = re.search(r'max_volume: (-?[\d.]+) dB', vol)
        gain = -1.5 - float(m.group(1)) if m else 0
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={gain:.2f}dB,afade=t=in:d=0.02', '-c:a', 'libmp3lame', '-b:a', '80k', out], check=True)
        os.remove(tmp)
        print(f'ok {item["file"]} {e-s:4.2f}s {item["text"]}')

main()
