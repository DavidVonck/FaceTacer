import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import io from "socket.io-client"

function Video() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const emotionRef = useRef();
    const socket = new io('ws://localhost:8080');
    const size = { width: 400, height: 300 };

    useEffect(() => {
        loadModels();
        setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            canvasRef.current.innerHtml = faceapi.
                createCanvasFromMedia(videoRef.current);

            faceapi.matchDimensions(canvasRef.current, size)
            const resized = faceapi.resizeResults(detections, size);
            faceapi.draw.drawDetections(canvasRef.current, resized);

            if (resized && Object.keys(resized).length > 0) {
                const expressions = resized[0].expressions;
                const maxValue = Math.max(...Object.values(expressions));
                const emotion = Object.keys(expressions).filter(
                    item => expressions[item] === maxValue
                );
                emotionRef.current.innerText = `${emotion[0]}`;
                socket.emit('message', emotion[0]);
            }
        }, 1000);
    });

    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]).then(startVideo);
    }

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
            })
            .catch((err) => {
                console.error(err)
            });
    }

    return (
        <div className="video">
            <video ref={videoRef} className="cam" autoPlay />
            <canvas ref={canvasRef} className='canvas' />
            <div ref={emotionRef} className="emotion" />
        </div>
    );
}

export default Video;