import React, { useState } from "react";
import "../src/DiagnosisForm.css"; // Import CSS for styling

const DiagnosisForm = () => {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms.split(",").map((s) => s.trim()), // Convert to array
          patientInfo: {
            age: Number(age),
            gender,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || "Error processing diagnosis.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container1">
      <h2>AI Medical Diagnosis</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group1">
          <label>Symptoms (comma-separated)</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />
        </div>
        <div className="form-group1">
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="form-group1">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Get Diagnosis"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result1">
          <h3>Diagnosis Result</h3>
          {result.result?.analysis?.possibleConditions?.length > 0 ? (
            result.result.analysis.possibleConditions.map((condition, index) => (
              <div key={index}>
                <p><strong>Condition:</strong> {condition.condition}</p>
                <p><strong>Description:</strong> {condition.description}</p>
                <p><strong>Risk Level:</strong> {condition.riskLevel}</p>
              </div>
            ))
          ) : (
            <p>No significant conditions detected.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosisForm;
