import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Patient } from '../../../../shared/models/Patient.model';
import { PatientService } from '../../../../core/services/patient-service';
import { PaymentService, PaymentRequest } from '../../../../core/services/payment.service';
import { AppointmentService, CreateAppointmentDto } from '../../../../core/services/appointment.service';
import { Router } from '@angular/router';
import { CalendarService } from '../../../calendar/services/calendar.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patientdetails-comp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatButtonModule, MatIconModule, TextFieldModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './patientdetails-comp.html',
  styleUrls: ['./patientdetails-comp.css'],
})
export class PatientdetailsComp implements OnInit {
  patientForm: FormGroup;
  isSubmitting: boolean = false;
  showBillBreakup: boolean = false;
  countryCodes = ['+91', '+1', '+44', '+61', '+33', '+49'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  appointmentData: any = null;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private service: PatientService,
    private paymentService: PaymentService,
    private appointmentService: AppointmentService,
    private calendarService: CalendarService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.patientForm = this.fb.group({
      date_of_birth: ['', Validators.required],
      sex: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      address: [''],
      marital_status: [''],
      blood_group: ['', Validators.required],
      allergies: [''],
      chief_medical_complaints: [''],
      consulted_before: [false],
      doctor_name: [''],
      last_review_date: [''],
      seeking_followup: [false],
      profile_image_path: [null],
      medical_reports_path: [null]
    });
  }

  ngOnInit() {
    // Retrieve appointment data from session storage
    const storedData = sessionStorage.getItem('pendingAppointment');
    if (storedData) {
      this.appointmentData = JSON.parse(storedData);

      // Fetch existing patient details
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.userID || currentUser?.id;

      if (userId) {
        this.service.getPatientByUserId(userId).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const patient = response.data;
              console.log('Fetching patient details:', patient);

              this.patientForm.patchValue({
                date_of_birth: patient.date_of_birth ? new Date(patient.date_of_birth) : '',
                sex: patient.sex,
                country: patient.country,
                pincode: patient.pincode,
                city: patient.city,
                state: patient.state,
                address: patient.address,
                marital_status: patient.marital_status,
                blood_group: patient.blood_group,
                allergies: patient.allergies,
                chief_medical_complaints: patient.chief_medical_complaints,
                consulted_before: patient.consulted_before,
                // doctor_name: patient.doctor_name, // Keep blank or pre-fill if custom logic needed
                last_review_date: patient.last_review_date ? new Date(patient.last_review_date) : '',
                seeking_followup: patient.seeking_followup
              });

              this.snackBar.open('Patient details loaded', 'Close', { duration: 2000 });
            }
          },
          error: (err) => {
            console.log('No existing patient record found or error fetching:', err);
            // Silent fail is okay here, user will just fill the form
          }
        });
      }

    } else {
      // If no appointment data, redirect back to patient dashboard
      this.snackBar.open('Please select an appointment slot first', 'Close', { duration: 3000 });
      this.router.navigate(['/patient']);
    }
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.patientForm.patchValue({ profile_image_path: file });
    } else {
      this.snackBar.open('Please select a valid image file', 'Close', { duration: 3000 });
    }
  }

  onPdfSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.patientForm.patchValue({ medical_reports_path: file });
    } else {
      this.snackBar.open('Please select a valid PDF file', 'Close', { duration: 3000 });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.patientForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.replace('_', ' ')} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.replace('_', ' ')} must be at least ${field.errors?.['minlength']?.requiredLength} characters`;
    }
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone_number') return 'Phone number must be 10 digits';
      if (fieldName === 'pincode') return 'Pincode must be 6 digits';
    }
    return '';
  }



  ADD() {
    console.log('ADD method called');
    console.log('Form valid:', this.patientForm.valid);

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.patientForm.value;

    // Get user_id from AuthService
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.userID || currentUser?.id;
    console.log('User ID from AuthService:', userId);

    // Format data for API
    const patientData = {
      user_id: userId || undefined, // Add user_id for EMR linking
      date_of_birth: formValue.date_of_birth ? this.formatDateLocal(formValue.date_of_birth) : '1990-01-01',
      sex: formValue.sex || 'M',
      country: formValue.country || '',
      pincode: formValue.pincode || '',
      city: formValue.city || '',
      state: formValue.state || '',
      address: formValue.address || '',
      marital_status: formValue.marital_status || '',
      blood_group: formValue.blood_group || '',
      allergies: formValue.allergies || '',
      chief_medical_complaints: formValue.chief_medical_complaints || '',
      consulted_before: formValue.consulted_before || false,
      doctor_name: formValue.doctor_name || '',
      ...(formValue.last_review_date && { last_review_date: this.formatDateLocal(formValue.last_review_date) }),
      seeking_followup: formValue.seeking_followup || false,
      profile_image_path: formValue.profile_image_path?.name || '',
      medical_reports_path: formValue.medical_reports_path?.name || ''
    };

    console.log('Sending patient data:', patientData);

    this.service.addPatient(patientData).subscribe({
      next: (response) => {
        console.log('Success response:', response);
        this.snackBar.open('Form submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Full error object:', error);
        console.error('Error details:', error.error);
        console.error('Validation errors:', error.error?.errors);
        if (error.error?.errors) {
          Object.keys(error.error.errors).forEach(key => {
            console.error(`${key}:`, error.error.errors[key]);
          });
        }
        this.snackBar.open('Error: ' + (error.error?.title || 'Failed to submit form'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  getPaymentAmount() {
    const baseAmount = 500;
    const isFollowUp = this.patientForm.get('seeking_followup')?.value;
    return isFollowUp ? baseAmount * 0.7 : baseAmount; // 30% discount for follow-up
  }

  getDiscount() {
    const isFollowUp = this.patientForm.get('seeking_followup')?.value;
    return isFollowUp ? 150 : 0; // 30% of 500
  }

  showBillBreakdown() {
    console.log('showBillBreakdown called');
    this.showBillBreakup = true;
    console.log('showBillBreakup set to:', this.showBillBreakup);
  }

  proceedToPayment() {
    this.showBillBreakup = false;
    this.processPayment();
  }

  cancelPayment() {
    this.showBillBreakup = false;
  }

  makePayment() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields before payment', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    this.showBillBreakdown();
  }

  processPayment() {
    if (this.isSubmitting) return; // Prevent multiple submissions
    this.isSubmitting = true;

    const isFollowup = this.patientForm.get('seeking_followup')?.value || false;
    console.log('Frontend - seeking_followup form value:', this.patientForm.get('seeking_followup')?.value);
    console.log('Frontend - isFollowup variable:', isFollowup);

    // Get user_id from AuthService
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.userID || currentUser?.id;
    console.log('User ID from AuthService for payment:', userId);

    // Step 1: Submit patient data first
    const formValue = this.patientForm.value;
    const patientData = {
      user_id: userId || undefined, // Add user_id for EMR linking
      date_of_birth: formValue.date_of_birth ? this.formatDateLocal(formValue.date_of_birth) : '1990-01-01',
      sex: formValue.sex || 'M',
      country: formValue.country || '',
      pincode: formValue.pincode || '',
      city: formValue.city || '',
      state: formValue.state || '',
      address: formValue.address || '',
      marital_status: formValue.marital_status || '',
      blood_group: formValue.blood_group || '',
      allergies: formValue.allergies || '',
      chief_medical_complaints: formValue.chief_medical_complaints || '',
      consulted_before: formValue.consulted_before || false,
      doctor_name: formValue.doctor_name || '',
      ...(formValue.last_review_date && { last_review_date: this.formatDateLocal(formValue.last_review_date) }),
      seeking_followup: formValue.seeking_followup || false,
      profile_image_path: formValue.profile_image_path?.name || '',
      medical_reports_path: formValue.medical_reports_path?.name || ''
    };

    console.log('Submitting patient data before payment...');
    this.service.addPatient(patientData).subscribe({
      next: (patientResponse) => {
        console.log('Patient data submitted successfully');
        console.log('Patient response:', patientResponse);

        // Step 2: Initiate payment with appointment details (appointment will be created after payment succeeds)
        if (!this.appointmentData) {
          this.snackBar.open('Appointment data missing', 'Close', { duration: 3000 });
          this.isSubmitting = false;
          return;
        }

        // IMPORTANT: Use the patient_id from the newly created patient record, not from localStorage
        const patientId = patientResponse?.patient?.patient_id;

        if (!patientId) {
          console.error('Failed to get patient_id from response:', patientResponse);
          this.snackBar.open('Failed to create patient record. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
          return;
        }

        console.log('Patient created with ID:', patientId);
        console.log('Appointment start time:', this.appointmentData.startTime);

        const paymentRequest: PaymentRequest = {
          amount: this.getPaymentAmount(),
          originalAmount: 500,
          discountAmount: this.getDiscount(),
          isFollowup: isFollowup,
          currency: 'INR',
          patientId: patientId,
          userId: userId || undefined, // Add userId for EMR linking
          description: 'Consultation Fee',
          // Include appointment booking details
          doctorId: this.appointmentData.doctorId,
          startTime: this.appointmentData.startTime,
          endTime: this.calculateEndTime(this.appointmentData.startTime),
          appointmentDate: this.appointmentData.appointmentDate,
          reasonForVisit: patientData.chief_medical_complaints || 'General Consultation'
        };

        console.log('Final PaymentRequest with appointment details:', paymentRequest);

        this.paymentService.createOrder(paymentRequest).subscribe({
          next: (response) => {
            console.log('Payment order created successfully:', response);
            console.log('Response structure:', JSON.stringify(response, null, 2));
            this.paymentService.initiatePayment(response).then((paymentResponse) => {
              console.log('Payment initiated successfully:', paymentResponse);
              this.paymentService.verifyPayment({
                razorpayOrderId: response.orderId,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                patientId: paymentRequest.patientId,
                userId: paymentRequest.userId, // Include userId
                doctorId: paymentRequest.doctorId,
                appointmentDate: paymentRequest.appointmentDate,
                startTime: paymentRequest.startTime,
                endTime: paymentRequest.endTime,
                reasonForVisit: paymentRequest.reasonForVisit,
                isFollowup: paymentRequest.isFollowup
              }).subscribe({
                next: (verificationResult) => {
                  console.log('Payment verified, now creating appointment...');

                  // Create appointment after successful payment
                  const appointmentDto: CreateAppointmentDto = {
                    patientID: userId || '',
                    doctorID: paymentRequest.doctorId || '',
                    appointmentDate: paymentRequest.appointmentDate || '',
                    startTime: paymentRequest.startTime || '',
                    endTime: paymentRequest.endTime || '',
                    appointmentType: paymentRequest.isFollowup ? 1 : 0,
                    reasonForVisit: paymentRequest.reasonForVisit || 'General Consultation'
                  };

                  console.log('Creating appointment with data:', appointmentDto);

                  this.appointmentService.createAppointment(appointmentDto).subscribe({
                    next: (appointmentResult) => {
                      console.log('Appointment created successfully:', appointmentResult);

                      this.snackBar.open('Payment successful! Appointment created.', 'Close', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                      });

                      // Clear session storage
                      sessionStorage.removeItem('pendingAppointment');

                      // Navigate back to patient dashboard with success state
                      this.router.navigate(['/patient'], {
                        queryParams: {
                          paymentSuccess: 'true',
                          billPath: verificationResult.billPath || '',
                          amount: paymentRequest.amount,
                          originalAmount: paymentRequest.originalAmount,
                          discountAmount: paymentRequest.discountAmount,
                          isFollowup: paymentRequest.isFollowup
                        }
                      });
                    },
                    error: (appointmentError) => {
                      console.error('Appointment creation error:', appointmentError);
                      this.snackBar.open('Payment successful but appointment creation failed. Please contact support.', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                      });
                      this.isSubmitting = false;
                    }
                  });
                },
                error: (error) => {
                  console.error('Payment verification error:', error);
                  this.snackBar.open('Payment verification failed: ' + (error.error?.message || error.message), 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                  });
                  this.isSubmitting = false;
                }
              });
            }).catch((error) => {
              console.error('Payment initiation error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              this.snackBar.open('Payment cancelled or failed: ' + (error.message || 'Unknown error'), 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              this.isSubmitting = false;
            });
          },
          error: (error) => {
            console.error('Create order error:', error);
            console.error('Error response:', JSON.stringify(error, null, 2));
            this.snackBar.open('Failed to create payment order: ' + (error.error?.message || error.message), 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Error submitting patient data:', error);
        this.snackBar.open('Failed to submit patient data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  private calculateEndTime(startTime: string): string {
    try {
      const [time, period] = startTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;

      const startDate = new Date();
      startDate.setHours(hour24, minutes, 0);

      const endDate = new Date(startDate.getTime() + 30 * 60000); // Add 30 minutes

      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);

      return `${displayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
    } catch {
      return startTime;
    }
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
