import React, { useState, useEffect, useRef, useMemo } from 'react';
import Slider, { Range } from 'rc-slider';
import axios from 'axios';
import qs from 'querystring';
import '../css/tailwind.css';
import 'rc-slider/assets/index.css';
import { image } from 'qr-image';

const RangeC = (Range as any) as React.Component;

const calculateFps = (w, h, fps, length) => {
  return (4 * (w * h * fps * length)) / 8;
};

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
  const [res, setRes] = useState<string>('');

  const [resScale, setResScale] = useState<number>(1);
  const [resFps, setResFps] = useState<number>(30);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const dlUrl = useMemo(() => {
    return (
      url &&
      clip &&
      'clip?' +
        qs.encode({
          url,
          start: clip[0],
          end: clip[1],
          fps: resFps,
          scale: resScale,
        })
    );
  }, [url, clip, resFps, resScale]);
  const size = useMemo(() => {
    return calculateFps(
      sizeRef.current.width * resScale,
      sizeRef.current.height * resScale,
      resFps,
      clip[1] - clip[0],
    );
  }, [clip, resFps, resScale]);
  const seekingRef = useRef(false);

  const updateProgress = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setProgress(time);
  };

  useEffect(() => {
    setUrl(localStorage.getItem('videoUrl'));
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (clip[1] && !seekingRef.current && progress >= clip[1]) {
      if (!loop) videoRef.current.pause();
      updateProgress(clip[0]);
    } else if (progress < clip[0]) {
      if (!videoRef.current.paused) videoRef.current.pause();
      updateProgress(clip[0]);
    }
  }, [progress]);

  useEffect(() => {
    const updateVolume = (e) => {
      setVolume(e.target.volume * 100);
    };
    videoRef.current?.addEventListener('volumechange', updateVolume);

    const updateTime = (e) => {
      setProgress(e.target.currentTime);
    };
    videoRef.current?.addEventListener('timeupdate', updateTime);

    const checkBounds = (e) => {
      if (e.target.currentTime >= clip[1]) {
        setProgress(clip[0]);
        e.target.currentTime = clip[0];
      }
    };
    videoRef.current?.addEventListener('play', updateTime);

    const toggle = (e) => {
      if (e.key === ' ') {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
        e.preventDefault();
        e.stopImmediatePropagation();
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
      localStorage.setItem('videoUrl', url);
      const {
        data: { data, bestVideo },
      } = await axios.get('/clipper/vid?' + qs.encode({ url }));
      setVideoSrc(data.url);
      videoRef.current.play();
      videoRef.current.muted = false;
      setFps(data.fps);
      setDuration(Number(data.approxDurationMs) / 1000);
      setClip([0, Number(data.approxDurationMs) / 1000]);
      sizeRef.current = {
        width: bestVideo.width,
        height: bestVideo.height,
      };
      setVolume(50);
    } catch {
      setVideoSrc('');
    }
  };

  const getGif = () => {
    setRes(
      'clip?' +
        qs.encode({
          url,
          start: clip[0],
          end: clip[1],
          fps: resFps,
          scale: resScale,
        }),
    );
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
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="rounded border bg-red-500 m-2 p-2 text-white"
              onClick={() => getVid()}
            >
              Search
            </button>
          </div>
          <div className="w-80 flex items-center mb-2">
            <input
              type="number"
              step=".01"
              className="p-2 rounded border border-black flex-shrink"
              value={clip[0]}
              min={0}
              max={clip[1]}
              onChange={(e) => {
                updateProgress(Number(e.target.value));
                setProgress(Number(e.target.value));
                setClip([Number(e.target.value), clip[1]]);
              }}
            />
            <div className="px-4 w-100 flex-grow">
              <RangeC
                allowCross={false}
                step=".01"
                min={0}
                max={duration}
                defaultValue={[0, 1]}
                value={clip}
                onBeforeChange={() => {
                  seekingRef.current = true;
                  videoRef.current.pause();
                }}
                onAfterChange={() => {
                  seekingRef.current = false;
                  videoRef.current.pause();
                }}
                onChange={(r) => {
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
              step=".01"
              value={clip[1]}
              min={clip[0]}
              max={duration}
              onChange={(e) => {
                updateProgress(Number(e.target.value));
                setClip([clip[0], Number(e.target.value)]);
              }}
            />
          </div>
          <div className="flex flex-col mb-2">
            <span>Progress</span>
            <div className="flex mb-2">
              <input
                type="number"
                step=".01"
                max={clip[1] ?? duration ?? 0}
                min={clip[0] ?? 0}
                className="p-2 mr-2 rounded border border-black flex-shrink"
                value={progress}
                onChange={(e) => {
                  updateProgress(Number(e.target.value));
                }}
              />
              <input
                type="range"
                step=".01"
                className="w-100 flex-grow p-2"
                max={clip[1] ?? duration ?? 0}
                min={clip[0] ?? 0}
                value={progress}
                onMouseDown={() => {
                  videoRef.current.pause();
                }}
                onChange={(e) => {
                  updateProgress(Number(e.target.value));
                }}
              />
            </div>
            <div className="flex">
              <button
                className="rounded bg-blue-200 p-2"
                onClick={() => {
                  setClip([progress, clip[1]]);
                }}
              >
                Set Start
              </button>
              <button
                className="rounded bg-blue-200 p-2"
                onClick={() => {
                  setClip([clip[0], progress]);
                }}
              >
                Set End
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <span>Volume</span>
            <input
              type="range"
              max="100"
              min="0"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="p-2"
            />
          </div>
          <div className="flex flex-col">
            <span>Quality Fps</span>
            <div>
              <input
                type="number"
                className="p-2 rounded border border-black flex-shrink"
                step=".01"
                max={`${fps}`}
                min="0"
                value={resFps}
                onChange={(e) => setResFps(Number(e.target.value))}
              />
              <input
                type="range"
                max={`${fps}`}
                min="0"
                step=".01"
                value={resFps}
                onChange={(e) => setResFps(Number(e.target.value))}
                className="p-2"
              />
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResFps(10)}
              >
                10fps
              </button>
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResFps(15)}
              >
                15fps
              </button>
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResFps(21)}
              >
                21fps
              </button>
            </div>
            <div>
              <input
                type="number"
                className="p-2 rounded border border-black flex-shrink"
                step=".01"
                max={`${1}`}
                min="0"
                value={resScale}
                onChange={(e) => setResScale(Number(e.target.value))}
              />
              <input
                type="range"
                max={`${1}`}
                min="0"
                step=".01"
                value={resScale}
                onChange={(e) => setResScale(Number(e.target.value))}
                className="p-2"
              />
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResScale(1080 / sizeRef.current.height)}
              >
                1080p
              </button>
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResScale(720 / sizeRef.current.height)}
              >
                720p
              </button>
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResScale(480 / sizeRef.current.height)}
              >
                480p
              </button>
              <button
                className="rounded bg-blue-400 p-2"
                onClick={() => setResScale(360 / sizeRef.current.height)}
              >
                360p
              </button>
            </div>
          </div>
          <span>
            Approx size: {size / 1000000} MB (
            {Math.round(sizeRef.current.width * resScale)}x
            {Math.round(sizeRef.current.height * resScale)}px){' '}
          </span>
          <div>
            <button className="rounded bg-blue-400 p-2" onClick={getGif}>
              Generate GIF !
            </button>
            {dlUrl && (
              <>
                <a
                  className="mx-2"
                  href={'/clipper/' + dlUrl + '&download=true'}
                  target="__blank"
                >
                  Download GIF !
                </a>
                <a
                  className="mx-2"
                  href={'/clipper/' + dlUrl + '&type=mp3&download=true'}
                  target="__blank"
                >
                  Download MP3 !
                </a>
                <a
                  className="mx-2"
                  href={'/clipper/' + dlUrl + '&type=mp4&download=true'}
                  target="__blank"
                >
                  Download MP4 !
                </a>
              </>
            )}
          </div>
        </div>
        {res && <img src={'/clipper/' + res} />}
      </div>
    </div>
  );
};
