"use client";

import { useState, useEffect } from "react";
import { 
  Moon, Sun, User, Zap, AlertTriangle, CheckCircle, 
  BarChart3, Activity, CreditCard, Phone, Wifi, Shield,
  Tv, Film, HelpCircle, Users, Home as HomeIcon, Loader2, Sparkles
} from "lucide-react";

interface PredictionResult {
  prediction: number;
  probability: number;
  churn_label: string;
}

interface FormData {
  gender: string;
  SeniorCitizen: string;
  Partner: string;
  Dependents: string;
  tenure: string;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: string;
  TotalCharges: string;
}

const initialFormData: FormData = {
  gender: "Male",
  SeniorCitizen: "0",
  Partner: "No",
  Dependents: "No",
  tenure: "12",
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: "",
  TotalCharges: "",
};

const selectOptions: Record<string, string[]> = {
  gender: ["Male", "Female"],
  SeniorCitizen: ["0", "1"],
  Partner: ["Yes", "No"],
  Dependents: ["Yes", "No"],
  PhoneService: ["Yes", "No"],
  MultipleLines: ["No", "Yes", "No phone service"],
  InternetService: ["Fiber optic", "DSL", "No"],
  OnlineSecurity: ["No", "Yes", "No internet service"],
  OnlineBackup: ["No", "Yes", "No internet service"],
  DeviceProtection: ["No", "Yes", "No internet service"],
  TechSupport: ["No", "Yes", "No internet service"],
  StreamingTV: ["No", "Yes", "No internet service"],
  StreamingMovies: ["No", "Yes", "No internet service"],
  Contract: ["Month-to-month", "One year", "Two year"],
  PaperlessBilling: ["Yes", "No"],
  PaymentMethod: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
};

const fieldIcons: Record<string, React.ReactNode> = {
  gender: <User className="w-4 h-4" />,
  SeniorCitizen: <HelpCircle className="w-4 h-4" />,
  Partner: <Users className="w-4 h-4" />,
  Dependents: <Users className="w-4 h-4" />,
  tenure: <Activity className="w-4 h-4" />,
  PhoneService: <Phone className="w-4 h-4" />,
  MultipleLines: <Phone className="w-4 h-4" />,
  InternetService: <Wifi className="w-4 h-4" />,
  OnlineSecurity: <Shield className="w-4 h-4" />,
  OnlineBackup: <Shield className="w-4 h-4" />,
  DeviceProtection: <Shield className="w-4 h-4" />,
  TechSupport: <HelpCircle className="w-4 h-4" />,
  StreamingTV: <Tv className="w-4 h-4" />,
  StreamingMovies: <Film className="w-4 h-4" />,
  Contract: <CreditCard className="w-4 h-4" />,
  PaperlessBilling: <CreditCard className="w-4 h-4" />,
  PaymentMethod: <CreditCard className="w-4 h-4" />,
  MonthlyCharges: <BarChart3 className="w-4 h-4" />,
  TotalCharges: <BarChart3 className="w-4 h-4" />,
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setProgressWidth(result.probability * 100);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setProgressWidth(0);
    }
  }, [result]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      gender: formData.gender,
      SeniorCitizen: parseInt(formData.SeniorCitizen),
      Partner: formData.Partner,
      Dependents: formData.Dependents,
      tenure: parseInt(formData.tenure),
      PhoneService: formData.PhoneService,
      MultipleLines: formData.MultipleLines,
      InternetService: formData.InternetService,
      OnlineSecurity: formData.OnlineSecurity,
      OnlineBackup: formData.OnlineBackup,
      DeviceProtection: formData.DeviceProtection,
      TechSupport: formData.TechSupport,
      StreamingTV: formData.StreamingTV,
      StreamingMovies: formData.StreamingMovies,
      Contract: formData.Contract,
      PaperlessBilling: formData.PaperlessBilling,
      PaymentMethod: formData.PaymentMethod,
      MonthlyCharges: parseFloat(formData.MonthlyCharges),
      TotalCharges: parseFloat(formData.TotalCharges),
    };

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to prediction service";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim();

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50"}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-blue-500" : "bg-blue-300"}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-purple-500" : "bg-purple-300"}`} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>ChurnPredict</h1>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>AI-Powered Customer Analytics</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all duration-300 ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-yellow-400" : "bg-white hover:bg-slate-50 text-slate-600 shadow-lg"}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-7">
            <div className={`backdrop-blur-xl rounded-3xl border p-6 lg:p-8 transition-all duration-300 ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200 shadow-xl"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Customer Profile</h2>
                  <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Enter customer details for churn analysis</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.keys(formData).map((key) => (
                    <div 
                      key={key} 
                      className={`${["PaymentMethod", "InternetService", "Contract"].includes(key) ? "md:col-span-2" : ""}`}
                    >
                      <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        <span className={`p-1 rounded ${darkMode ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-blue-500"}`}>
                          {fieldIcons[key]}
                        </span>
                        {formatLabel(key)}
                      </label>
                      {selectOptions[key] ? (
                        <select
                          name={key}
                          value={formData[key as keyof FormData]}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 ${
                            darkMode 
                              ? "bg-slate-800/80 border border-slate-700 text-white hover:border-slate-600" 
                              : "bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300"
                          }`}
                        >
                          {selectOptions[key].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={key.includes("Charges") || key === "tenure" ? "number" : "text"}
                          name={key}
                          value={formData[key as keyof FormData]}
                          onChange={handleChange}
                          required
                          step={key.includes("Charges") ? "0.01" : undefined}
                          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 ${
                            darkMode 
                              ? "bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 hover:border-slate-600" 
                              : "bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300"
                          }`}
                          placeholder="Enter value..."
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden group mt-6 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 hover:from-blue-600 hover:via-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        Predict Churn
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {error && (
              <div className={`backdrop-blur-xl rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}>
                <div className={`p-2 rounded-lg ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}>
                  <AlertTriangle className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`} />
                </div>
                <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>
              </div>
            )}

            {result && (
              <div className={`backdrop-blur-xl rounded-3xl border p-8 transition-all duration-500 ${
                result.prediction === 1 
                  ? darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"
                  : darkMode ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"
              }`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-all duration-500 ${
                    result.prediction === 1 
                      ? "bg-gradient-to-br from-red-500 to-red-600" 
                      : "bg-gradient-to-br from-green-500 to-green-600"
                  }`}>
                    {result.prediction === 1 ? (
                      <AlertTriangle className="w-10 h-10 text-white" />
                    ) : (
                      <CheckCircle className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold ${result.prediction === 1 ? "text-red-500" : "text-green-500"}`}>
                    {result.prediction === 1 ? "High Churn Risk" : "Customer Stable"}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {result.prediction === 1 ? "Immediate action recommended" : "Customer is likely to stay"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Churn Probability</span>
                    <span className={`text-2xl font-bold ${result.prediction === 1 ? "text-red-500" : "text-green-500"}`}>
                      {(result.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className={`h-4 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        result.prediction === 1 
                          ? "bg-gradient-to-r from-red-500 via-red-400 to-red-500" 
                          : "bg-gradient-to-r from-green-400 via-green-500 to-green-400"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Safe</span>
                    <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Critical</span>
                  </div>
                </div>

                <div className={`mt-6 p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-white/60"}`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={darkMode ? "bg-slate-700/50 p-3 rounded-lg" : "bg-slate-100 p-3 rounded-lg"}>
                      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Prediction</div>
                      <div className={`font-semibold ${result.prediction === 1 ? "text-red-400" : "text-green-400"}`}>
                        {result.prediction === 1 ? "Churn" : "No Churn"}
                      </div>
                    </div>
                    <div className={darkMode ? "bg-slate-700/50 p-3 rounded-lg" : "bg-slate-100 p-3 rounded-lg"}>
                      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Confidence</div>
                      <div className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
                        {Math.max(result.probability, 1 - result.probability).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className={`backdrop-blur-xl rounded-3xl border p-8 text-center ${darkMode ? "bg-slate-900/40 border-slate-800 border-dashed" : "bg-white/60 border-slate-200 border-dashed"}`}>
                <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                  <BarChart3 className={`w-10 h-10 ${darkMode ? "text-slate-600" : "text-slate-400"}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>Ready to Predict</h3>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Fill in the customer information to get churn predictions</p>
              </div>
            )}

            {loading && (
              <div className={`backdrop-blur-xl rounded-3xl border p-8 text-center ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white/60 border-slate-200"}`}>
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>Analyzing...</h3>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Processing customer data through ML model</p>
              </div>
            )}

            <div className={`backdrop-blur-xl rounded-2xl border p-5 ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white/60 border-slate-200"}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                <Activity className="w-5 h-5 text-blue-500" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Model Accuracy</span>
                  <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>79.91%</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>API Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-green-500">Online</span>
                  </span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Total Predictions</span>
                  <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>7,043</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={`text-center mt-10 text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          <p>Powered by Machine Learning • ChurnPredict v1.0</p>
        </footer>
      </div>
    </div>
  );
}