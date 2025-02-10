"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadFoodImage({
  image,
  setImage,
  preview,
  setPreview,
  handleScanClick,
  handleSubmit,
}) {
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  return (
    // Changed "ml-[250px]" to "mx-auto" to center the component horizontally
    <div className="w-full mx-auto mt-32 mb-12 max-w-2xl">
      <div className="rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-white">Upload Food Image</h2>
          <p className="text-gray-400">
            Take a photo or upload an image of your food label
          </p>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-700 rounded-lg p-12 mt-6">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              {!image ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-sm text-gray-300 text-center">
                    Drag & drop your food image, or click to select
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    Supports PNG, JPG or JPEG
                  </p>
                </div>
              ) : (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                  <img src={preview} alt="Food Label Preview" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex gap-4 mt-6">
                <Button onClick={handleScanClick} className="bg-purple-600 hover:bg-purple-700">
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
                <Button onClick={handleSubmit} disabled={!image} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Food
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
