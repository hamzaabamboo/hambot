import React, { useState, useEffect, useRef } from 'react';
import Slider, { Range } from 'rc-slider';
import axios from 'axios';
import qs from 'querystring';
import '../css/tailwind.css';
import 'rc-slider/assets/index.css';

const RangeC = (Range as any) as React.Component;

export default ({ name }: { name: string }) => {
  const [url, setUrl] = useState<string>(
    'https://www.youtube.com/watch?v=ebSce4xUjo0',
  );
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [video, setVideoSrc] = useState<string>();
  const [clip, setClip] = useState<[number, number]>([0, 0]);
  const [fps, setFps] = useState<number>(30);
  const [loop, setLoop] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekingRef = useRef(false);

  const updateProgress = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time / fps;
    }
    setProgress(time);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (
      clip[1] &&
      !seekingRef.current &&
      Math.round(progress) > Math.round(clip[1])
    ) {
      if (!loop) videoRef.current.pause();
      updateProgress(clip[0]);
    } else if (Math.round(progress) < Math.round(clip[0])) {
      if (!videoRef.current.paused) videoRef.current.pause();
      updateProgress(clip[0]);
    }
  }, [progress]);

  useEffect(() => {
    const updateVolume = e => {
      setVolume(e.target.volume * 100);
    };
    videoRef.current?.addEventListener('volumechange', updateVolume);

    const updateTime = e => {
      setProgress(e.target.currentTime * fps);
    };
    videoRef.current?.addEventListener('timeupdate', updateTime);

    const checkBounds = e => {
      if (e.target.currentTime * fps >= clip[1]) {
        setProgress(clip[0]);
        e.target.currentTime = clip[0] * fps;
      }
    };
    videoRef.current?.addEventListener('play', updateTime);

    const toggle = e => {
      if (e.key === ' ') {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
        e.preventDefault();
      }
    };
    const _window = window;
    _window?.addEventListener('keypress', toggle);
    return () => {
      videoRef.current?.removeEventListener('volumechange', updateVolume);
      videoRef.current?.removeEventListener('timeupdate', updateTime);
      videoRef.current?.removeEventListener('play', checkBounds);
      _window?.removeEventListener('keypress', toggle);
    };
  }, [video]);

  const getVid = async () => {
    try {
      const { data } = await axios.get('vid?' + qs.encode({ url }));
      setVideoSrc(data.url);
      videoRef.current.play();
      videoRef.current.muted = false;
      setFps(data.fps);
      setDuration((Number(data.approxDurationMs) / 1000) * data.fps);
      setClip([0, (Number(data.approxDurationMs) / 1000) * data.fps]);
      setVolume(50);
    } catch {
      setVideoSrc('');
    }
  };

  return (
    <div className="flex justify-center flex-col items-center min-h-screen py-2">
      <div className="flex justify-center flex-col items-center py-2">
        <h1 className="text-6xl text-bold text-center">
          Video Clipping Tool V1!
        </h1>
        {video && <video ref={videoRef} src={video} autoPlay controls></video>}
        <div className="flex flex-col w-4/5 mx-auto">
          <div>
            <input
              type="text"
              className="p-2 mr-2 rounded border w-full border-black"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <button
              className="rounded border bg-red-500 m-2 p-2 text-white"
              onClick={() => getVid()}
            >
              Search
            </button>
          </div>
          <div className="w-80 flex items-center">
            <input
              type="number"
              className="p-2 rounded border border-black flex-shrink"
              value={clip[0]}
              min={0}
              max={clip[1]}
              onChange={e => {
                updateProgress(Number(e.target.value));
                setProgress(Number(e.target.value));
                setClip([Number(e.target.value), clip[1]]);
              }}
            />
            <div className="px-4 w-100 flex-grow">
              <RangeC
                allowCross={false}
                min={0}
                max={duration}
                defaultValue={[0, 1]}
                value={clip}
                onBeforeChange={() => {
                  videoRef.current.pause();
                }}
                onChange={r => {
                  if (clip[0] !== r[0]) {
                    updateProgress(r[0]);
                  } else {
                    updateProgress(r[1]);
                  }
                  setClip(r);
                }}
              />
            </div>
            <input
              type="number"
              className="p-2 rounded border border-black flex-shrink"
              value={clip[1]}
              min={clip[0]}
              max={duration}
              onChange={e => {
                updateProgress(Number(e.target.value));
                setClip([clip[0], Number(e.target.value)]);
              }}
            />
          </div>
          <div className="flex flex-col">
            <span>Progress</span>
            <div className="flex">
              <input
                type="number"
                max={clip[1] ?? duration ?? 0}
                min={clip[0] ?? 0}
                className="p-2 mr-2 rounded border border-black flex-shrink"
                value={Math.floor(progress)}
                onChange={e => {
                  updateProgress(Number(e.target.value));
                }}
              />
              <input
                type="range"
                className="w-100 flex-grow p-2"
                max={clip[1] ?? duration ?? 0}
                min={clip[0] ?? 0}
                value={progress}
                onMouseDown={() => {
                  videoRef.current.pause();
                }}
                onChange={e => {
                  updateProgress(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span>Volume</span>
            <input
              type="range"
              max="100"
              min="0"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
