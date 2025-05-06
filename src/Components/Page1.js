import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RosProvider, useRos, useService } from "react-ros";

function ImageController() {
  const { isConnected, ros } = useRos();
  const [imageSrc, setImageSrc] = useState("");

  const { callService } = useService({
    ros,
    serviceName: "/fetch_image_service",
    serviceType: "your_interfaces/srv/FetchImage",
  });

  const fetchImage = (direction) => {
    callService(
      { direction },
      (response) => {
        setImageSrc(`data:image/jpeg;base64,${response.image_data}`);
      },
      (err) => console.error("Service call error:", err)
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p>{isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <div className="flex gap-4">
        <Button onClick={() => fetchImage("prev")}>Prev</Button>
        <Button onClick={() => fetchImage("next")}>Next</Button>
      </div>

      <Card className="max-w-xl w-full">
        <CardContent className="flex items-center justify-center p-4">
          {imageSrc ? (
            <img src={imageSrc} alt="ROS Image" className="rounded-xl" />
          ) : (
            <p>No image loaded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <RosProvider url="ws://localhost:9090">
      <ImageController />
    </RosProvider>
  );
}

export default App;
