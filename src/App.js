import React, { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';

function App() {
  const rosRef = useRef(null);
  const [status, setStatus] = useState('Connecting to ROS...');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Connect to ROSBridge
    rosRef.current = new ROSLIB.Ros({
      url: 'ws://192.168.1.117:9090'
    });

    rosRef.current.on('connection', () => {
      console.log('✅ Connected to ROSBridge');
      setStatus('Connected to ROS');
    });

    rosRef.current.on('error', (error) => {
      console.error('❌ ROSBridge error:', error);
      setStatus('Connection error');
    });

    rosRef.current.on('close', () => {
      console.log('🔌 Disconnected from ROS');
      setStatus('Disconnected from ROS');
    });

    // Subscribe to /detected_image
    const imageTopic = new ROSLIB.Topic({
      ros: rosRef.current,
      name: '/detection_image/compressed',
      messageType: 'sensor_msgs/msg/CompressedImage'
    });

    imageTopic.subscribe((message) => {
      const base64Image = 'data:image/jpeg;base64,' + message.data;
      setImageSrc(base64Image);
    });

    // Cleanup on unmount
    return () => {
      imageTopic.unsubscribe();
      rosRef.current?.close();
    };
  }, []);

  // Service clients
  const startDetectionNode = () => {
    const service = new ROSLIB.Service({
      ros: rosRef.current,
      name: '/control_launch',
      serviceType: 'std_srvs/srv/SetBool'
    });

    const request = new ROSLIB.ServiceRequest({ data: true });

    service.callService(request, (result) => {
      alert(result.message);
    });
  };

  const navigateImage = (command) => {
    const service = new ROSLIB.Service({
      ros: rosRef.current,
      name: '/navigate_image',
      serviceType: 'sensors_config/srv/ImageNav'
    });

    const request = new ROSLIB.ServiceRequest({ command });

    service.callService(request, (result) => {
      // alert(result.message);
      console.log(result.message);
    });
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>ROS2 Image Detection Dashboard</h1>
      <p>{status}</p>

      <div>
        <button onClick={startDetectionNode}>Start Detection</button>
        <button onClick={() => navigateImage('previous')}>Previous Image</button>
        <button onClick={() => navigateImage('next')}>Next Image</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Detected Image:</h3>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Detected from ROS"
            style={{ width: '640px', border: '2px solid #444' }}
          />
        ) : (
          <p>No image received yet</p>
        )}
      </div>
    </div>
  );
}

export default App;
