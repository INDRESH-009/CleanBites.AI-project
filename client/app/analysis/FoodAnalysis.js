"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Car, Droplet, Apple, Check, AlertTriangle, X, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

export default function FoodAnalysis({
  analysisResult,
  getBadgeClasses,
  getProcessingLevelVariant,
  getProgressIndicatorClass,
  getRiskMeterVariant,
}) {
  if (!analysisResult) return null;

  const carbs = parseFloat(analysisResult.macros?.["Carbohydrates"]?.quantity) || 0;
  const fats = parseFloat(analysisResult.macros?.["Fats"]?.quantity) || 0;
  const proteins = parseFloat(analysisResult.macros?.["Proteins"]?.quantity) || 0;
  const totalRaw = carbs + fats + proteins;
  const total = totalRaw.toFixed(1);
  const macroData = [
    { name: "Carbs", value: carbs, color: "#FF6384" },
    { name: "Fats", value: fats, color: "#36A2EB" },
    { name: "Proteins", value: proteins, color: "#FFCE56" },
  ];

  return (
    <section className="py-6 scroll-mt-20">
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden mt-6">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="text-2xl font-bold">AI Food Analysis</CardTitle>
          <CardDescription className="text-purple-100">
            Comprehensive nutritional insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900">Total Calories</p>
                    <p className="text-2xl text-gray-900 font-bold">
                      {analysisResult.calories || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Processing Level</p>
                    <Badge variant={getProcessingLevelVariant(analysisResult.processingLevel)} className="mt-1">
                      {analysisResult.processingLevel || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Health Score</h3>
                <Progress
                  value={analysisResult.healthScore || 0}
                  className={`h-3 bg-gray-200 ${getProgressIndicatorClass(analysisResult.healthScore || 0)}`}
                />
                <p className="text-right text-sm text-gray-900 mt-1">
                  {analysisResult.healthScore || 0} / 100
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Carbon Footprint</h3>
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-gray-700" />
                  <p className="text-sm text-gray-900">
                    {analysisResult.carbonFootprint || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Macronutrients</h3>
                {analysisResult.macros ? (
                  <>
                    <div className="relative mx-auto" style={{ width: "200px", height: "200px" }}>
                      <PieChart width={200} height={200} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={macroData}
                          cx={100}
                          cy={100}
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          startAngle={-90}
                          endAngle={270}
                        >
                          {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translate(-50%, -50%)", top: "50%", left: "50%" }}>
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">{total}g</p>
                          <p className="text-sm text-gray-900">Total</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {macroData.map((macro) => (
                        <div key={macro.name} className="text-center">
                          <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: macro.color }}></div>
                          <p className="text-sm font-medium text-gray-900">{macro.name}</p>
                          <p className="text-xs text-gray-900">{macro.value}g</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-900">No data available</p>
                )}
              </div>
            </div>
            {/* Right Side */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sugar Content</h3>
                <div className="flex items-center space-x-2">
                  <Droplet className="w-5 h-5 text-blue-500" />
                  <p className="text-xl font-bold text-gray-900">
                    {analysisResult.sugarContent?.totalSugar || "N/A"}g
                  </p>
                </div>
                <p className="text-sm text-gray-900 mt-1">
                  {analysisResult.sugarContent?.sugarSources
                    ? `Source: ${analysisResult.sugarContent.sugarSources.join(", ")}`
                    : "Source: N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Micronutrients</h3>
                {analysisResult.micros && analysisResult.micros.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.micros.map((micro, idx) => (
                      <Badge key={idx} variant="secondary">{micro}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">No micronutrients data</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Harmful Ingredients</h3>
                {analysisResult.harmfulIngredients && analysisResult.harmfulIngredients.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.harmfulIngredients.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{item.name}:</span> {item.effect}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-900">No harmful ingredients detected.</p>
                )}
              </div>
              {analysisResult.personalizedAnalysis?.medicalConditionImpact && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personalized Analysis</h3>
                  <Card className="bg-orange-100 border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-orange-800">Medical Condition Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`mb-2 ${getBadgeClasses(getRiskMeterVariant(analysisResult.personalizedAnalysis.medicalConditionImpact.riskMeter))}`}>
                        {analysisResult.personalizedAnalysis.medicalConditionImpact.riskMeter || "N/A"}
                      </Badge>
                      <p className="text-sm text-orange-800">
                        {analysisResult.personalizedAnalysis.medicalConditionImpact.warning || "No warnings provided."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              {analysisResult.personalizedAnalysis?.healthGoalImpact && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Health Goal Impact</h3>
                  <p className="text-sm text-gray-900 mb-2">
                    {analysisResult.personalizedAnalysis.healthGoalImpact.impactSummary || "No impact summary provided."}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-900 font-medium">Goal Alignment:</p>
                    <Progress
                      value={analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0}
                      className={`h-2 flex-grow bg-gray-200 ${getProgressIndicatorClass(analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0)}`}
                    />
                    <p className="text-sm text-gray-900">
                      {analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0} / 100
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {analysisResult.personalizedAnalysis?.goodAndBadEffects && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Good & Bad Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-800">Pros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.personalizedAnalysis.goodAndBadEffects.pros &&
                    analysisResult.personalizedAnalysis.goodAndBadEffects.pros.length > 0 ? (
                      <ul className="space-y-2">
                        {analysisResult.personalizedAnalysis.goodAndBadEffects.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Check className="w-5 h-5 text-green-500" />
                            <p className="text-sm text-green-800">{pro}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-900">No pros listed.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-red-100 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-800">Cons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.personalizedAnalysis.goodAndBadEffects.cons &&
                    analysisResult.personalizedAnalysis.goodAndBadEffects.cons.length > 0 ? (
                      <ul className="space-y-2">
                        {analysisResult.personalizedAnalysis.goodAndBadEffects.cons.map((con, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <X className="w-5 h-5 text-red-500" />
                            <p className="text-sm text-red-800">{con}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-900">No cons listed.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {analysisResult.personalizedAnalysis?.healthierAlternatives &&
            analysisResult.personalizedAnalysis.healthierAlternatives.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Healthier Alternatives</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.personalizedAnalysis.healthierAlternatives.map((alt, idx) => (
                  <Card key={idx} className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                        <Apple className="w-5 h-5" />
                        <span>{alt.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-2">
                        <Progress value={alt.healthScore || 0} className={`h-2 flex-grow bg-blue-200 bg-blue-500`} />
                        <p className="text-sm font-medium text-blue-800">
                          {alt.healthScore || 0} / 100
                        </p>
                      </div>
                      <p className="text-sm text-blue-800">{alt.reason || "No reason provided."}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {analysisResult.personalizedAnalysis?.futureImpact && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Future Impact</h3>
              <Card className="bg-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <p className="text-sm text-purple-800 mb-2">
                    {analysisResult.personalizedAnalysis.futureImpact.longTermEffect || "No long-term effect provided."}
                  </p>
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="w-5 h-5 text-purple-500" />
                    <p className="text-sm font-medium text-purple-800">
                      Weight Gain Risk:{" "}
                      {analysisResult.personalizedAnalysis.futureImpact.weightGainRisk || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
