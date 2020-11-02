import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Range } from 'rc-slider';
import { Slider } from './components/Slider';
import axios from 'axios';
import qs from 'querystring';
import '../css/tailwind.css';
const RangeC = (Range as any) as React.Component;

const calculateFps = (w: number, h: number, fps: number, length: number) => {
  return (4 * (w * h * fps * length)) / 8;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Coordinate {
  x: number;
  y: number;
}

interface Dimension {
  width: number;
  height: number;
}
export default () => {
  const [url, setUrl] = useState<string>(
    'https://www.youtube.com/watch?v=ebSce4xUjo0',
  );
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [video, setVideoSrc] = useState<string>('');
  const [clip, setClip] = useState<[number, number]>([0, 0]);
  const [fps, setFps] = useState<number>(30);
  const [loop, setLoop] = useState<boolean>(true);
  const [res, setRes] = useState<string>('');

  const [dimension, setDimensions] = useState<Dimension>({
    width: 1,
    height: 1,
  });
  const cropPositionRef = useRef<Coordinate>({
    x: 0,
    y: 0,
  });
  const cropDimensionRef = useRef<Dimension>({
    width: 1,
    height: 1,
  });

  const [cropDimension, setCropDimesion] = useState<Dimension>({
    width: 1,
    height: 1,
  });

  const [cropPosition, setCropPosition] = useState<Coordinate>({
    x: 0,
    y: 0,
  });

  const [resScale, setResScale] = useState<number>(1);
  const [resFps, setResFps] = useState<number>(30);

  const [isPlaying, _setPlaying] = useState<boolean>(false);
  const [isCropping, setCropping] = useState<boolean>(false);

  const [maxQuality, setMaxQuality] = useState<boolean>(false);

  const [prefetchProgress, setPrefetchProgress] = useState<number>(0);
  const [isPreloading, setPreloading] = useState<boolean | 'error' | 'done'>(
    false,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);

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
          ...(isCropping ? cropDimension : {}),
          ...(isCropping ? cropPosition : {}),
          max: maxQuality,
        })
    );
  }, [
    url,
    clip,
    resFps,
    resScale,
    cropDimension,
    cropPosition,
    isCropping,
    maxQuality,
  ]);

  const size = useMemo(() => {
    return calculateFps(
      (maxQuality ? 1980 : dimension.width) *
        (isCropping ? cropDimension.width : 1) *
        resScale,
      (maxQuality ? 1980 : dimension.height) *
        (isCropping ? cropDimension.height : 1) *
        resScale,
      resFps,
      clip[1] - clip[0],
    );
  }, [
    clip,
    resFps,
    resScale,
    isCropping,
    maxQuality,
    dimension.width,
    cropDimension.width,
    dimension.height,
    cropDimension.height,
  ]);

  const seekingRef = useRef(false);

  const setPlaying = (play: boolean) => {
    if (play) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
    _setPlaying(play);
  };

  const updateProgress = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setProgress(time);
  };

  useEffect(() => {
    setUrl(localStorage.getItem('videoUrl') ?? '');
    updateCrop();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (clip[1] && !seekingRef.current && progress >= clip[1]) {
      if (!loop) updateProgress(clip[0]);
      else setPlaying(false);
    } else if (progress < clip[0]) {
      if (!videoRef.current?.paused) setPlaying(false);
      updateProgress(clip[0]);
    }
  }, [progress, clip, loop]);

  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (videoRef.current?.paused) setPlaying(true);
        else setPlaying(false);
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    };
    window.addEventListener('keypress', toggle);
    return () => {
      window.removeEventListener('keypress', toggle);
    };
  }, [video]);

  const getVid = async () => {
    try {
      localStorage.setItem('videoUrl', url);
      const {
        data: { data, bestVideo },
      } = await axios.get('/clipper/vid?' + qs.encode({ url }));
      setVideoSrc(data.url);
      if (videoRef.current) {
        setPlaying(true);
        videoRef.current.muted = false;
      }
      setFps(data.fps);
      setDuration(Number(data.approxDurationMs) / 1000);
      setClip([0, Number(data.approxDurationMs) / 1000]);
      setDimensions({
        width: bestVideo.width,
        height: bestVideo.height,
      });
      cropPositionRef.current = { x: 0, y: 0 };
      cropDimensionRef.current = { width: 1, height: 1 };
      resetCrop();
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
          ...(isCropping ? cropDimension : {}),
          ...(isCropping ? cropPosition : {}),
          max: maxQuality,
        }),
    );
  };

  const setCrop = () => {
    setCropDimesion(cropDimensionRef.current);
    setCropPosition(cropPositionRef.current);
  };

  const handleDrag = (type: 'pos' | 'size' | 'all') => (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const target = event.nativeEvent.target as HTMLDivElement;
    let shiftX =
      event.nativeEvent.clientX - target.getBoundingClientRect().left;
    let shiftY = event.nativeEvent.clientY - target.getBoundingClientRect().top;
    event.nativeEvent.stopPropagation();
    event.nativeEvent.preventDefault();
    const t = playerRef.current as HTMLDivElement;

    const rect = t.getBoundingClientRect();

    function onMouseEnter(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function onMouseMove(event: MouseEvent) {
      if (type === 'pos') {
        const x2 =
          cropPositionRef.current.x +
          rect.left * cropDimensionRef.current.width;
        const y2 =
          cropPositionRef.current.y +
          rect.top * cropDimensionRef.current.height;
        const xOff = event.clientX - shiftX - rect.left;
        const yOff = event.clientY - shiftY - rect.top;

        const cropper = cropperRef.current as HTMLDivElement;

        const xDim = (x2 - xOff) / rect.width;
        const yDim = (y2 - yOff) / rect.height;

        if (yOff > 0 && yOff < y2) {
          cropDimensionRef.current.height = yDim / rect.height;
          cropper.style.height = yDim * 100 + '%';
          cropPositionRef.current.y = yOff / rect.height;
          cropper.style.top = yOff + 'px';
        }
        if (xOff > 0 && xOff < x2) {
          cropDimensionRef.current.width = xDim / rect.width;
          cropper.style.width = xDim * 100 + '%';
          cropPositionRef.current.x = xOff / rect.height;
          cropper.style.left = xOff + 'px';
        }
      }
      if (type === 'all') {
        const xOff = event.clientX - shiftX - rect.left;
        const yOff = event.clientY - shiftY - rect.top;
        const cropper = cropperRef.current as HTMLDivElement;
        if (
          yOff > 0 &&
          yOff + cropDimensionRef.current.height * rect.height < rect.height
        ) {
          cropPositionRef.current.y = yOff / rect.height;
          cropper.style.top = yOff + 'px';
        }
        if (
          xOff > 0 &&
          xOff + cropDimensionRef.current.width * rect.width < rect.width
        ) {
          cropPositionRef.current.x = xOff / rect.width;
          cropper.style.left = xOff + 'px';
        }
      }
      if (type === 'size') {
        const xOff =
          event.clientX -
          rect.left -
          cropPositionRef.current.x * rect.width +
          event.movementX;
        const yOff =
          event.clientY -
          rect.top -
          cropPositionRef.current.y * rect.height +
          event.movementY;
        const cropper = cropperRef.current as HTMLDivElement;
        const xDim = xOff / rect.width;
        const yDim = yOff / rect.height;
        console.log(xDim, yDim);
        if (yOff > 0 && yOff < rect.height) {
          cropDimensionRef.current.height = yDim;
          cropper.style.height = yDim * 100 + '%';
        }
        if (xOff > 0 && xOff < rect.width) {
          cropDimensionRef.current.width = xDim;
          cropper.style.width = xDim * 100 + '%';
        }
      }
    }

    // move the ball on mousemove
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseenter', onMouseEnter);

    target.onmouseleave = function () {
      console.log('upp!!!');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseenter', onMouseEnter);
      target.onmouseup = null;
      target.onmouseleave = null;
    };

    target.onmouseup = function () {
      console.log('upp!!!');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseenter', onMouseEnter);
      target.onmouseup = null;
      target.onmouseleave = null;
    };
  };

  const resetCrop = () => {
    cropDimensionRef.current.width = 1;
    cropPositionRef.current.x = 0;
    cropDimensionRef.current.height = 1;
    cropPositionRef.current.y = 0;

    updateCrop();
  };

  const updateCrop = () => {
    const cropper = cropperRef.current as HTMLDivElement;
    const rect = playerRef.current?.getBoundingClientRect();

    cropper.style.width = cropDimensionRef.current.width * 100 + '%';
    cropper.style.left = cropPositionRef.current.x * (rect?.width ?? 0) + 'px';
    cropper.style.height = cropDimensionRef.current.height * 100 + '%';
    cropper.style.top = cropPositionRef.current.y * (rect?.height ?? 0) + 'px';
  };

  const fetchProgress = async () => {
    try {
      const { data } = await axios.get(
        '/clipper/preload?' + qs.encode({ url, max: maxQuality }),
      );
      const { progress } = data;
      if (progress === 100) {
        setPreloading('done');
        setPrefetchProgress(100);
        return true;
      } else {
        setPreloading(true);
        setPrefetchProgress(progress);
        return false;
      }
    } catch {
      setPreloading('error');
    }
  };

  const preload = () => {
    const f = async () => {
      const res = await fetchProgress();
      await sleep(2000);
      if (!res) await f();
    };
    f();
  };
  return (
    <div className="flex justify-center flex-col items-center min-h-screen py-2">
      <div className="flex justify-center flex-col items-center py-2">
        <h1 className="text-6xl font-bold text-center">
          Video Clipping Tool V1.2!
        </h1>
        <div ref={playerRef} className="m-2 relative">
          <div
            className="absolute z-20"
            ref={cropperRef}
            style={{
              display: isCropping ? 'block' : 'none',
            }}
          >
            <div
              className="bg-gray-500 w-full h-full opacity-25 z-30"
              draggable
              onMouseDown={handleDrag('all')}
              onDragStart={() => {
                return false;
              }}
            ></div>
            <div
              className="w-8 h-8 rounded-full bg-red-600 opacity-75 absolute z-40"
              style={{ top: '-1rem', left: '-1rem' }}
              draggable
              onMouseDown={handleDrag('pos')}
              onDragStart={() => {
                return false;
              }}
            ></div>
            <div
              className="w-8 h-8 rounded-full bg-red-600 opacity-75 absolute z-40"
              style={{ bottom: '-1rem', right: '-1rem' }}
              draggable
              onMouseDown={handleDrag('size')}
              onDragStart={() => {
                return false;
              }}
            ></div>
          </div>
          <video
            ref={videoRef}
            src={video}
            onVolumeChange={(e) => {
              setVolume((e.target as HTMLVideoElement).volume * 100);
            }}
            onTimeUpdate={(e) => {
              setProgress((e.target as HTMLVideoElement).currentTime);
            }}
            onPlay={(e) => {
              if ((e.target as HTMLVideoElement).currentTime >= clip[1]) {
                setProgress(clip[0]);
                (e.target as HTMLVideoElement).currentTime = clip[0];
              }
            }}
            autoPlay
            controls
          ></video>
        </div>
        <div className="flex flex-col w-4/5 mx-auto">
          <div>
            <input
              type="text"
              className="p-2 mr-2 rounded border w-full border-black"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="rounded border bg-red-500 mr-2 my-2 p-2 text-white"
              onClick={() => getVid()}
            >
              Load video
            </button>
            <button
              className="rounded border bg-blue-500 mr-2 my-2 p-2 text-white"
              onClick={() => setPlaying(!isPlaying)}
            >
              {!isPlaying ? 'Play' : 'Pause'}
            </button>
            <button
              className="rounded border bg-green-500 mr-2 my-2 p-2 text-white"
              onClick={() => setLoop(!loop)}
            >
              {!loop ? 'No Loop' : 'Loop'}
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
                step={0.01}
                min={0}
                max={duration}
                defaultValue={[0, 1]}
                value={clip}
                onBeforeChange={() => {
                  seekingRef.current = true;
                  videoRef.current?.pause();
                }}
                onAfterChange={() => {
                  seekingRef.current = false;
                  videoRef.current?.pause();
                }}
                onChange={(r) => {
                  if (clip[0] !== r[0]) {
                    updateProgress(r[0]);
                  } else {
                    updateProgress(r[1]);
                  }
                  setClip(r as [number, number]);
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
            <span className="text-lg font-bold mb-2">Progress</span>
            <Slider
              step={0.01}
              max={clip[1] ?? duration ?? 0}
              min={clip[0] ?? 0}
              value={progress}
              onChange={(e) => {
                updateProgress(e);
              }}
            />
            <div className="flex">
              <button
                className="rounded bg-blue-200 p-2 mr-2"
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
            <span className="text-lg font-bold mb-2">Volume</span>
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
            <span className="text-lg font-bold mb-2">Fps</span>
            <div>
              <Slider
                step={0.01}
                max={fps}
                min={0}
                value={resFps}
                onChange={(e) => {
                  setResFps(e);
                }}
              />
              <button
                className="rounded bg-blue-400 mr-2 p-2"
                onClick={() => setResFps(10)}
              >
                10fps
              </button>
              <button
                className="rounded bg-blue-400 mr-2 p-2"
                onClick={() => setResFps(15)}
              >
                15fps
              </button>
              <button
                className="rounded bg-blue-400 mr-2 p-2"
                onClick={() => setResFps(21)}
              >
                21fps
              </button>
            </div>
            <span className="text-lg font-bold mb-2">Scale</span>
            <div>
              <Slider
                step={0.01}
                max={1}
                min={0}
                value={resScale}
                onChange={(e) => {
                  setResScale(e);
                }}
              />
              <button
                className="rounded bg-blue-400 p-2  mr-2"
                onClick={() => setResScale(1)}
              >
                100%
              </button>
              <button
                className="rounded bg-blue-400 p-2  mr-2"
                onClick={() => setResScale(0.75)}
              >
                75%
              </button>
              <button
                className="rounded bg-blue-400 p-2  mr-2"
                onClick={() => setResScale(0.5)}
              >
                50%
              </button>
              <button
                className="rounded bg-blue-400 p-2  mr-2"
                onClick={() => setResScale(0.25)}
              >
                25%
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Crop</h3>
            <div className="flex-row">
              <button
                className="rounded bg-blue-400 p-2 mr-2"
                onClick={() => setCropping((c) => !c)}
              >
                {isCropping ? 'No Crop' : 'Crop'}
              </button>
              <button
                className="rounded bg-blue-400 p-2 mr-2"
                onClick={setCrop}
              >
                Set Crop
              </button>
              <button
                className="rounded bg-red-400 p-2 mr-2"
                onClick={resetCrop}
              >
                Reset Crop
              </button>
              <button
                className="rounded bg-blue-400 p-2 mr-2"
                onClick={() => setMaxQuality((c) => !c)}
              >
                {maxQuality ? 'Max Quality' : 'Normal Quality'}
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Preloading</h3>
            <div className="flex-row">
              <button
                className="rounded bg-blue-400 p-2 mr-2"
                onClick={() => preload()}
                disabled={isPreloading === true}
              >
                Preload
              </button>
              {isPreloading && (
                <span>
                  {isPreloading === 'done'
                    ? 'Done'
                    : isPreloading === 'error'
                    ? `Error`
                    : `Preload ${prefetchProgress}%`}
                </span>
              )}
            </div>
          </div>
          <span>
            Approx size: {size / 1000000} MB (
            {Math.round(
              (maxQuality ? 1980 : dimension.width) *
                (isCropping ? cropDimension.width : 1) *
                resScale,
            )}
            x
            {Math.round(
              (maxQuality ? 1080 : dimension.height) *
                (isCropping ? cropDimension.height : 1) *
                resScale,
            )}
            px){' '}
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
        <div className="p-2">
          {res && <img alt="result gif" src={'/clipper/' + res} />}
        </div>
      </div>
    </div>
  );
};
