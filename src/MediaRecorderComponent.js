import { useEffect, useState, useRef } from 'react';
import { getBrowser } from './libs/Helpers';
import './style/media_recorder.scss';

const MediaRecorderComponent = () => {
    const chunks = [];
    /**
     * State
     */
    const [isRecording, setRecordingStatus] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState({});
    const [downloadUrl, setDownloadUrl] = useState('#');
    const [fileName, setFileName] = useState('');
    /**
     * Lifetime cycles (via hook)
     * Empty array we are passing
     * Since i want useEffect to be run only once upon mounting
     */
    useEffect(() => {
        initMediaRecorder();
    }, []);
    /**
     * Set up references for the DOM elements
     */
    const liveVideoElementRef = useRef(null);
    // const downloadLinkRef = useRef(null);
    /**
     * Build configuration object for media stream
     * Support: only Chrome / Firefox
     * Due Media Recording API support limitations
     *
     * @return Object
     */
    const getMediaStreamConfig = () => {
        let options = {};
        const browser = getBrowser();
        if (browser.name === 'Chrome') {
            options = {
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 640,
                        maxWidth: 640,
                        minHeight: 480,
                        maxHeight: 480
                    },
                    optional: []
                }
            };
        } else if (browser.name === 'Firefox') {
            options = {
                audio: true,
                video: {
                    width: {
                        min: 640,
                        ideal: 640,
                        max: 640
                    },
                    height: {
                        min: 480,
                        ideal: 480,
                        max: 480
                    }
                }
            };
        }
        return options;
    }
    const mediaStreamConfig = getMediaStreamConfig();
    /**
     * Initialize media stream
     *
     */
    const initMediaRecorder = async () => {
        /*
            Handling limitations errors
        */
        if (!navigator.mediaDevices.getUserMedia || window.MediaRecorder === undefined) {
            console.log('navigator.mediaDevices.getUserMedia or MediaRecorder not supported on your browser, use the latest version of Firefox or Chrome');
            return;
        }
        /*
            Initialize media stream
            And play it by default
        */
        const streamObject = await navigator.mediaDevices.getUserMedia(mediaStreamConfig);
        liveVideoElementRef.current.srcObject = streamObject;
        liveVideoElementRef.current.play();
        /*
            Initialize media recorder object 
        */
        let containerType = 'video/webm';
        let mediaRecorderObject = null;
        if (typeof MediaRecorder.isTypeSupported === 'function') {
            let options = {
                mimeType: 'video/mp4'
            }
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                options['mimeType'] = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
                options['mimeType'] = 'video/webm;codecs=h264';
            } else  if (MediaRecorder.isTypeSupported('video/webm')) {
                options['mimeType'] = 'video/webm';
            } else {
                containerType = "video/mp4";
            }
            mediaRecorderObject = new MediaRecorder(streamObject, options);
        } else {
            mediaRecorderObject = new MediaRecorder(streamObject);
        }
        /*
            Media recorder events listeners
            Fill up chunks with a data
            Use to build video for download
        */
        mediaRecorderObject.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        /*
            Media recorder events listeners
            Stop recording even handler
        */
        mediaRecorderObject.onstop = () => {
            /*
                Build download link
            */
			const recording = new Blob(chunks, {
                type: mediaRecorder.mimeType
            });
            const downloadUrl = URL.createObjectURL(recording);
            /*
                Build the filename
            */
            let fileName = '';
            const rand =  Math.floor((Math.random() * 10000000));
			switch(containerType) {
				case "video/mp4": {
                    fileName  = `video_${rand}.mp4`;
					break;
                }
				default: {
                    fileName  = `video_${rand}.webm`;
                }
            }
            /*
                Set state variables
            */
            setFileName(fileName);
            setDownloadUrl(downloadUrl);
		};
        /*
            Update state
        */
        setMediaRecorder(mediaRecorderObject);
    }
    
    /**
     * Controls
     * Start recording
     */
    const beginRecord = () => {
        if (!isRecording) {
            mediaRecorder.start(1000);
            setRecordingStatus(true);
        }
    }
    /**
     * Controls
     * Stop recording
     */
    const stopRecord = () => {
        if (isRecording) {
            mediaRecorder.stop();
            setRecordingStatus(false);
        }
    }

    return (
        <div className="media_recorder">
            <div className="media_recorder__video-element">
                <video ref={liveVideoElementRef} controls></video>
            </div>
            <div className="media_recorder__controls">
                <div className="media_recorder__controls__left">
                    <button className={isRecording ? 'media_recorder__controls__button disabled' : 'media_recorder__controls__button'} disabled={isRecording} onClick={beginRecord}>Start recording</button>
                    <button className={isRecording ? 'media_recorder__controls__button' : 'media_recorder__controls__button disabled'} disabled={!isRecording} onClick={stopRecord}>Stop recording</button>
                </div>
                <a href={downloadUrl} download={fileName} name={fileName} className={downloadUrl === '#' ? 'media_recorder__controls__button disabled' : 'media_recorder__controls__button'}>Download</a>
            </div>
        </div>
    );
}

export default MediaRecorderComponent;
