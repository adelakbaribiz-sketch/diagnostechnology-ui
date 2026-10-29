// Demo content for the DiagnosTechnology interface prototype.
// All patients, cases and numbers below are synthetic. No figure here is a clinical result.

window.DT = (function () {
  // status: "live" = demonstrable MVP module, "dev" = phase-one development, "planned" = roadmap
  const platforms = [
    { id: "neuro", name: "Neuro AI", hue: "neuro", inputs: "MRI, CT, EEG", indications: [
      ["Alzheimer's disease", "live", "Brain MRI"], ["Parkinson's disease", "planned", "MRI, gait and voice"], ["Multiple sclerosis", "planned", "Brain MRI"],
      ["Epilepsy", "planned", "EEG"], ["Stroke", "planned", "CT, CT angiography"], ["Migraine", "planned", "Clinical history"]] },
    { id: "psych", name: "Psych AI", hue: "psych", inputs: "Validated scales, clinical notes", indications: [
      ["Depression", "planned", "PHQ-9, clinical notes"], ["Generalized anxiety disorder", "planned", "GAD-7, clinical notes"], ["Bipolar disorder", "planned", "Clinical history"],
      ["Schizophrenia", "planned", "Clinical notes, fMRI"], ["PTSD", "planned", "PCL-5, clinical notes"]] },
    { id: "cardio", name: "Cardio AI", hue: "cardio", inputs: "ECG, Holter, echo, labs", indications: [
      ["Coronary artery disease", "dev", "Clinical parameters, ECG"], ["Heart failure", "planned", "Echo, NT-proBNP"], ["Atrial fibrillation", "live", "12-lead ECG, Holter"],
      ["Hypertension", "planned", "BP series, labs"], ["Myocardial infarction", "planned", "ECG, troponin"], ["Valvular heart disease", "planned", "Echo"]] },
    { id: "metab", name: "Diabetes & Metabolic AI", hue: "metab", inputs: "Labs, clinical records", indications: [
      ["Type 1 diabetes", "planned", "HbA1c, glucose, antibodies"], ["Type 2 diabetes", "planned", "HbA1c, fasting glucose"], ["Prediabetes", "planned", "HbA1c, OGTT"],
      ["Diabetic neuropathy", "planned", "Nerve conduction, foot exam"], ["Metabolic syndrome", "planned", "Lipids, waist, BP"]] },
    { id: "nephro", name: "Nephrology AI", hue: "nephro", inputs: "Labs, renal imaging", indications: [
      ["Chronic kidney disease", "dev", "eGFR, creatinine, urine ACR"], ["Acute kidney injury", "planned", "Creatinine series"], ["Kidney failure", "planned", "eGFR trend"],
      ["Glomerulonephritis", "planned", "Urinalysis, biopsy"], ["Kidney stones", "planned", "CT KUB"]] },
    { id: "gastro", name: "Gastro & Hepatic AI", hue: "gastro", inputs: "Endoscopy, labs, ultrasound", indications: [
      ["Crohn's disease", "planned", "Endoscopy, calprotectin"], ["Ulcerative colitis", "planned", "Colonoscopy"], ["Irritable bowel syndrome", "planned", "Symptom scores"],
      ["Celiac disease", "planned", "tTG-IgA, biopsy"], ["Fatty liver disease", "planned", "Ultrasound, elastography"]] },
    { id: "pulm", name: "Pulmonary AI", hue: "pulm", inputs: "Chest imaging, spirometry, sleep studies", indications: [
      ["COPD", "planned", "Spirometry, CT"], ["Asthma", "planned", "Spirometry"], ["Pneumonia", "planned", "Chest X-ray"], ["Pulmonary fibrosis", "planned", "HRCT"],
      ["Sleep apnea", "planned", "Polysomnography"], ["Pulmonary hypertension", "planned", "Echo, CT"], ["Bronchiectasis", "planned", "HRCT"], ["Tuberculosis", "planned", "Chest X-ray"]] },
    { id: "cancer", name: "Cancer AI", hue: "cancer", inputs: "Imaging, pathology, markers", indications: [
      ["Breast cancer", "planned", "Mammography"], ["Lung cancer", "planned", "Low-dose CT"], ["Colorectal cancer", "planned", "Colonoscopy, FIT"], ["Prostate cancer", "planned", "MRI, PSA"],
      ["Liver cancer", "planned", "CT, MRI, AFP"], ["Pancreatic cancer", "planned", "CT"], ["Gastric cancer", "planned", "Endoscopy"], ["Ovarian cancer", "planned", "Ultrasound, CA-125"],
      ["Kidney cancer", "planned", "CT"], ["Bladder cancer", "planned", "Cystoscopy, urine cytology"]] },
  ];
  // Melanoma is a demonstrable MVP module that sits outside the 50 planned indications.
  const extensions = [{ name: "Melanoma / skin cancer", platform: "cancer", status: "live", input: "Dermoscopy image" }];

  const statusText = { live: "Available", dev: "In development", planned: "Planned" };

  const patients = [
    { id: "P-24081", name: "Maryam Rezaei", age: 64, sex: "F", ward: "Neurology clinic", physician: "Dr. Karimi" },
    { id: "P-24082", name: "Hossein Ahmadi", age: 58, sex: "M", ward: "Cardiology", physician: "Dr. Moradi" },
    { id: "P-24083", name: "Leila Hosseini", age: 41, sex: "F", ward: "Dermatology clinic", physician: "Dr. Jafari" },
    { id: "P-24084", name: "Reza Mohammadi", age: 72, sex: "M", ward: "Neurology clinic", physician: "Dr. Karimi" },
    { id: "P-24085", name: "Sara Kazemi", age: 35, sex: "F", ward: "Cardiology", physician: "Dr. Moradi" },
    { id: "P-24086", name: "Ali Nouri", age: 67, sex: "M", ward: "Nephrology", physician: "Dr. Sadeghi" },
  ];

  // review: "awaiting" = report ready, waiting for physician sign-off
  const cases = [
    { id: "C-1043", patient: "P-24082", indication: "Atrial fibrillation", input: "12-lead ECG", created: "Today, 09:12", state: "awaiting", flag: "high" },
    { id: "C-1042", patient: "P-24081", indication: "Alzheimer's disease", input: "Brain MRI", created: "Today, 08:40", state: "processing", flag: null },
    { id: "C-1041", patient: "P-24083", indication: "Melanoma / skin cancer", input: "Dermoscopy image", created: "Yesterday, 16:05", state: "signed", flag: "low" },
    { id: "C-1040", patient: "P-24084", indication: "Alzheimer's disease", input: "Brain MRI", created: "Yesterday, 11:30", state: "awaiting", flag: "moderate" },
    { id: "C-1039", patient: "P-24085", indication: "Atrial fibrillation", input: "Holter (24 h)", created: "27 Oct, 14:22", state: "signed", flag: "low" },
  ];

  // Hospital view: registrations per month (synthetic) and the fee model used in the business plan
  const fee = 1000000; // toman per registration
  const hospitalShare = 0.2;
  const months = [["May", 118], ["Jun", 164], ["Jul", 201], ["Aug", 236], ["Sep", 282], ["Oct", 309]];

  return { platforms, extensions, statusText, patients, cases, fee, hospitalShare, months };
})();
