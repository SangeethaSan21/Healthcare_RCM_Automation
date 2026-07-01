import { PatientData } from '../pages/PatientPage';
import { VerificationData } from '../pages/InsurancePage';
import { ClaimData } from '../pages/ClaimsPage';
import { ARCallData } from '../pages/ARCallingPage';
import { PaymentData } from '../pages/PaymentPage';
import { AppealData } from '../pages/DenialPage';

// ── Patients ─────────────────────────────────────────────────────────────────
export const patientData = {
  validPatient: {
    firstName: 'Arjun',
    lastName: 'Mehta',
    dob: '1985-06-15',
    gender: 'Male',
    phone: '+91-9988776655',
    email: 'arjun.mehta@email.com',
    address: '42, Indiranagar, Bangalore - 560038',
    insuranceProvider: 'Star Health Insurance',
    policyNumber: 'POL-SH-TEST-001',
    referringPhysician: 'Dr. Ramesh Iyer',
    admissionDate: '2024-11-25',
  } as PatientData,

  femalePatient: {
    firstName: 'Deepa',
    lastName: 'Krishnan',
    dob: '1972-09-20',
    gender: 'Female',
    phone: '+91-9977665544',
    email: 'deepa.k@email.com',
    address: 'Koramangala, Bangalore',
    insuranceProvider: 'United Health Care',
    policyNumber: 'POL-UHC-TEST-002',
    admissionDate: '2024-11-28',
  } as PatientData,

  // For validation testing — missing required fields
  incompletePatient: {
    firstName: '',
    lastName: '',
    dob: '',
    gender: '' as any,
    phone: '',
    insuranceProvider: '' as any,
    policyNumber: '',
  } as PatientData,
};

// ── Insurance Verifications ───────────────────────────────────────────────────
export const verificationData = {
  verifiedInsurance: {
    patientId: 'PAT-001',
    payer: 'Star Health Insurance',
    policyNumber: 'POL-SH-VERIFY-01',
    coveragePercent: 80,
    validUntil: '2026-12-31',
    coPay: 500,
    deductible: 2000,
    status: 'Verified',
  } as VerificationData,

  failedInsurance: {
    patientId: 'PAT-002',
    payer: 'HDFC ERGO',
    policyNumber: 'POL-HE-INVALID',
    coveragePercent: 0,
    validUntil: '2023-01-01',  // Expired
    status: 'Failed',
  } as VerificationData,

  pendingInsurance: {
    patientId: 'PAT-003',
    payer: 'United Health Care',
    policyNumber: 'POL-UHC-PEND-01',
    coveragePercent: 70,
    validUntil: '2025-06-30',
    coPay: 300,
    status: 'Pending',
  } as VerificationData,
};

// ── Claims ────────────────────────────────────────────────────────────────────
export const claimData = {
  officeVisitClaim: {
    patientId: 'PAT-001',
    payer: 'Star Health Insurance',
    cptCode: '99213',
    icdCode: 'I10',
    dateOfService: '2024-11-25',
    chargeAmount: 3500,
    renderingProvider: 'Dr. Ramesh Iyer (Cardiology)',
    placeOfService: '11 — Office',
    clinicalNotes: 'Hypertension management follow-up',
  } as ClaimData,

  inpatientClaim: {
    patientId: 'PAT-002',
    payer: 'United Health Care',
    cptCode: '99232',
    icdCode: 'E11.9',
    dateOfService: '2024-11-28',
    chargeAmount: 8500,
    renderingProvider: 'Dr. Anita Sharma (General Medicine)',
    placeOfService: '21 — Inpatient Hospital',
    clinicalNotes: 'Diabetes management — inpatient',
  } as ClaimData,

  surgicalClaim: {
    patientId: 'PAT-003',
    payer: 'HDFC ERGO',
    cptCode: '27447',
    icdCode: 'M17.11',
    dateOfService: '2024-11-20',
    chargeAmount: 95000,
    renderingProvider: 'Dr. Suresh Nair (Orthopaedics)',
    placeOfService: '21 — Inpatient Hospital',
    clinicalNotes: 'Total knee arthroplasty — right knee',
  } as ClaimData,

  labClaim: {
    patientId: 'PAT-001',
    payer: 'Star Health Insurance',
    cptCode: '80053',
    icdCode: 'Z00.00',
    dateOfService: '2024-11-26',
    chargeAmount: 2200,
    renderingProvider: 'Dr. Priya Menon (Radiology)',
    placeOfService: '22 — Outpatient Hospital',
    clinicalNotes: 'Annual metabolic panel',
  } as ClaimData,
};

// ── AR Calls ──────────────────────────────────────────────────────────────────
export const arCallData = {
  inProcessCall: {
    claimId: 'CLM-2024-002',
    payer: 'United Health Care',
    callDate: '2024-11-15',
    agentName: 'Priya R.',
    outcome: 'Claim in process',
    followUpDate: '2024-11-25',
    notes: 'Reference number: UHC-REF-2024-9901. Processing in 15 days.',
  } as ARCallData,

  additionalInfoCall: {
    claimId: 'CLM-2024-003',
    payer: 'HDFC ERGO',
    callDate: '2024-11-18',
    agentName: 'Suresh K.',
    outcome: 'Additional info requested',
    followUpDate: '2024-11-28',
    notes: 'Prior auth required — submitting PA form',
  } as ARCallData,

  escalatedCall: {
    claimId: 'CLM-2024-001',
    payer: 'Star Health Insurance',
    callDate: '2024-11-20',
    agentName: 'Meena V.',
    outcome: 'Escalated to supervisor',
    followUpDate: '2024-11-27',
    notes: 'Dispute over coverage — escalated to Sr. Rep',
  } as ARCallData,
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentData = {
  fullPayment: {
    claimId: 'CLM-2024-003',   // Approved in seed, no prior payments
    paidAmount: 90000,          // Full amount = Paid status
    paymentType: 'Insurance Payment',
    paymentDate: '2024-11-20',
    referenceNumber: 'EFT-LS-001234',
  } as PaymentData,

  partialPayment: {
    claimId: 'CLM-2024-002',   // Submitted claim — now visible in dropdown since we show all claims
    paidAmount: 1500,           // Less than total (2800) → Partial status
    paymentType: 'Partial Payment',
    paymentDate: '2024-11-22',
    referenceNumber: 'CHK-UHC-005678',
  } as PaymentData,

  coPayment: {
    claimId: 'CLM-2024-001',   // Approved — seed data already has PAY-001 against this, that's fine
    paidAmount: 700,            // Remaining balance after seed PAY-001 (3500-2800=700)
    paymentType: 'Patient Co-pay',
    paymentDate: '2024-11-21',
    referenceNumber: 'CASH-001',
  } as PaymentData,
};

// ── Denial Appeals ────────────────────────────────────────────────────────────
export const appealData = {
  priorAuthAppeal: {
    claimId: 'CLM-2024-003',
    appealType: 'Prior Auth Missing',
    appealDate: '2024-11-25',
    justification: 'Prior authorization was obtained on 2024-11-10. Reference PA-2024-5678. Attaching PA approval letter from HDFC ERGO.',
    supportingDocs: 'Prior Auth Letter',
  } as AppealData,

  medicalNecessityAppeal: {
    claimId: 'CLM-2024-005',
    appealType: 'Medical Necessity',
    appealDate: '2024-11-26',
    justification: 'Chest X-ray was medically necessary for emergency pneumonia diagnosis. Patient presented with acute respiratory distress. Attaching emergency physician notes.',
    supportingDocs: 'Medical Records',
  } as AppealData,

  codingErrorAppeal: {
    claimId: 'CLM-2024-003',
    appealType: 'Coding Error',
    appealDate: '2024-11-27',
    justification: 'CPT code 27447 is correct for total knee replacement. Initial denial was due to incorrect modifier. Resubmitting with modifier -RT.',
    supportingDocs: 'Physician Letter of Necessity',
  } as AppealData,
};
