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
    const downloadLinkRef = useRef(null);
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
                audio: false,
                video: {
                    mandatory: {
                        minWidth: 320,
                        maxWidth: 320,
                        minHeight: 240,
                        maxHeight: 240
                    },
                    optional: []
                }
            };
        } else if (browser.name === 'Firefox') {
            options = {
                audio: true,
                video: {
                    width: {
                        min: 320,
                        ideal: 320,
                        max: 1280
                    },
                    height: {
                        min: 240,
                        ideal: 240,
                        max: 720
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
			const recording = new Blob(chunks, {
                type: mediaRecorder.mimeType
            });
            const downloadUrl = URL.createObjectURL(recording);
            downloadLinkRef.current.href = downloadUrl;
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
            downloadLinkRef.current.setAttribute('download', fileName);
			downloadLinkRef.current.setAttribute('name', fileName);
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
        mediaRecorder.start(1000);
        setRecordingStatus(true);
    }
    /**
     * Controls
     * Stop recording
     */
    const stopRecord = () => {
        mediaRecorder.stop();
        setRecordingStatus(false);
    }

    return (
        <div className="media_recorder">
            <div className="media_recorder__video-element">
                <video ref={liveVideoElementRef} controls autoPlay playsInline></video>
            </div>
            <div className="media_recorder__controls">
                <button className="media_recorder__controls__button" disabled={isRecording} onClick={beginRecord}>Start recording</button>
                <button className="media_recorder__controls__button" disabled={!isRecording} onClick={stopRecord}>Stop recording</button>
                <a ref={downloadLinkRef} href="#" className="media_recorder__controls__button">Download</a>
            </div>
        </div>
    );
}

export default MediaRecorderComponent;
