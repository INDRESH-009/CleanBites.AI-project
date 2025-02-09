"use client";

import React from "react";

const TagSelector = ({ name, label, options, selectedValues, onTagClick }) => (
  <div className="space-y-2 col-span-2">
    <label className="text-gray-300">{label}:</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <span
          key={option}
          className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${
            selectedValues.includes(option)
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => onTagClick(name, option)}
        >
          {option}
        </span>
      ))}
    </div>
  </div>
);

const EditProfileModal = ({
  formData,
  setFormData,
  setIsEditing,
  handleSubmit,
  handleChange,
}) => {
  // Toggle selection for pill-based fields
  const handleTagClick = (name, value) => {
    if (formData[name].includes(value)) {
      setFormData({
        ...formData,
        [name]: formData[name].filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: [...formData[name], value],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      {/* Card Container with max-height and scroll if needed */}
      <div className="relative z-10 w-full max-w-3xl p-8 mx-4 rounded-xl backdrop-blur-md bg-black/70 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Update Health Details
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Age */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
              required
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Weight */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Weight (kg):</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
              required
            />
          </div>

          {/* Height */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Height (cm):</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
              required
            />
          </div>

          {/* Activity Level */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Activity Level:</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
            >
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          </div>

          {/* Dietary Preferences */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Dietary Preferences:</label>
            <select
              name="dietaryPreferences"
              value={formData.dietaryPreferences}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
            >
              <option value="None">None</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Keto">Keto</option>
              <option value="Paleo">Paleo</option>
            </select>
          </div>

          {/* Health Goals */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">Health Goals:</label>
            <select
              name="healthGoals"
              value={formData.healthGoals}
              onChange={handleChange}
              className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Wellness">General Wellness</option>
              <option value="Low-Sodium Diet">Low-Sodium Diet</option>
              <option value="Heart Health">Heart Health</option>
              <option value="Diabetes Management">Diabetes Management</option>
            </select>
          </div>

          {/* Allergies Pills */}
          <TagSelector
            name="allergies"
            label="Allergies"
            options={["None", "Nuts", "Dairy", "Shellfish", "Eggs", "Soy", "Wheat"]}
            selectedValues={formData.allergies}
            onTagClick={handleTagClick}
          />

          {/* Medical Conditions Pills */}
          <TagSelector
            name="medicalConditions"
            label="Medical Conditions"
            options={[
              "None",
              "Diabetes",
              "Hypertension",
              "High Cholesterol",
              "Lactose Intolerance",
              "Celiac Disease",
              "PCOS",
              "Thyroid Issues",
              "Heart Disease",
              "Kidney Disease",
            ]}
            selectedValues={formData.medicalConditions}
            onTagClick={handleTagClick}
          />

          {/* Submit and Cancel Buttons */}
          <div className="col-span-2 flex justify-center gap-4 mt-4">
            <button
              type="submit"
              className="w-1/2 max-w-xs bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 rounded-full shadow-md transition-all transform hover:scale-105"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              type="button"
              className="w-1/2 max-w-xs bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 rounded-full shadow-md transition-all transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
