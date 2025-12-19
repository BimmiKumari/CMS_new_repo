import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { RoleType } from '../../shared/models/auth.models';

@Component({
  selector: 'bulk-invite',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule],
  template: `
    <div class="bulk-invite-container">
      <div class="content-wrapper">
        <!-- Guide Section -->
        <div class="guide-section">
          <div class="guide-header">
            <mat-icon class="guide-icon">info</mat-icon>
            <h3>How to Send Bulk Invitations</h3>
          </div>
          <div class="guide-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Download Template</h4>
                <p>Click the "Download Template" button to get the CSV file format</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Fill Data</h4>
                <p>Add email addresses, names, and phone numbers to the template</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Upload & Send</h4>
                <p>Upload the completed file and send invitations to all users</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Form Section -->
        <div class="form-wrapper">
          <div class="bulk-invite-form">
        <div class="form-section">
          <div class="section-title">
            <mat-icon>file_download</mat-icon>
            <h4>Step 1: Download Template</h4>
          </div>
          <button mat-stroked-button (click)="downloadTemplate()" class="template-btn" [disabled]="loading">
            <mat-icon>download</mat-icon>
            Download CSV Template
          </button>
        </div>
        
        <div class="form-section">
          <div class="section-title">
            <mat-icon>upload_file</mat-icon>
            <h4>Step 2: Upload Completed File</h4>
          </div>
          <div class="upload-area">
            <input type="file" #fileInput (change)="onFile($event)" accept=".csv,.xlsx,.xls" hidden>
            <div class="file-drop-zone" (click)="fileInput.click()">
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <div class="upload-text">
                <h5>{{ file ? file.name : 'Choose File to Upload' }}</h5>
                <p>Select CSV or Excel file with completed data</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <div class="section-title">
            <mat-icon>settings</mat-icon>
            <h4>Step 3: Configure & Send</h4>
          </div>
          <div class="config-row">
            <mat-form-field appearance="outline" class="role-field">
              <mat-label>Default Role</mat-label>
              <mat-select [(value)]="role">
                <mat-option [value]="RoleType.Staff">Staff Member</mat-option>
                <mat-option [value]="RoleType.Doctor">Doctor</mat-option>
              </mat-select>
            </mat-form-field>
            
            <button mat-raised-button (click)="upload()" [disabled]="!file || loading" class="upload-btn">
              <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
              <mat-icon *ngIf="!loading">send</mat-icon>
              <span *ngIf="!loading">Send Bulk Invitations</span>
              <span *ngIf="loading">Processing...</span>
            </button>
          </div>
        </div>
        
            <div *ngIf="error" class="error-message">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="resultList?.length" class="results-section">
        <div class="results-header">
          <mat-icon>assessment</mat-icon>
          <h4>Invitation Results</h4>
        </div>
        <div class="results-list">
          <div *ngFor="let r of resultList" class="result-item" [ngClass]="getResultClass(r)">
            <div class="result-content">
              <mat-icon>{{ getResultIcon(r) }}</mat-icon>
              <span>{{ r }}</span>
            </div>
            <div *ngIf="r.startsWith('AlreadySent:')" class="result-actions">
              <button mat-button (click)="resendFromResult(r)" [disabled]="loading" class="resend-btn">
                <mat-icon>refresh</mat-icon>
                Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bulk-invite-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .content-wrapper {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }
    
    .guide-section {
      flex: 0 0 30%;
      min-width: 300px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 2rem;
      position: sticky;
      top: 2rem;
    }
    
    .form-wrapper {
      flex: 1;
      min-width: 400px;
    }
    
    .guide-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .guide-icon {
      color: #10b981;
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
    }
    
    .guide-header h3 {
      color: #065f46;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    
    .guide-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    
    .step-content h4 {
      color: #065f46;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }
    
    .step-content p {
      color: #047857;
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.4;
    }
    
    .bulk-invite-form {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      margin-bottom: 2rem;
      overflow: hidden;
    }
    
    .form-section {
      padding: 2rem;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .form-section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .section-title mat-icon {
      color: #10b981;
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
    }
    
    .section-title h4 {
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
    
    .upload-area {
      margin-bottom: 1rem;
    }
    
    .file-drop-zone {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f9fafb;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .file-drop-zone:hover {
      border-color: #10b981;
      background: #f0fdf4;
    }
    
    .upload-icon {
      font-size: 2.5rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      color: #6b7280;
      flex-shrink: 0;
    }
    
    .file-drop-zone:hover .upload-icon {
      color: #10b981;
    }
    
    .upload-text {
      text-align: left;
    }
    
    .upload-text h5 {
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }
    
    .upload-text p {
      color: #6b7280;
      font-size: 0.9rem;
      margin: 0;
    }
    
    .file-drop-zone h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .file-drop-zone p {
      margin: 0;
      opacity: 0.8;
    }
    
    .config-row {
      display: flex;
      gap: 2rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    

    
    .role-field {
      max-width: 200px;
    }
    

    
    .template-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      color: #10b981;
      border-color: #10b981;
      font-weight: 500;
      border-radius: 8px;
    }
    
    .template-btn:hover {
      background: #f0fdf4;
      border-color: #059669;
      color: #059669;
    }
    
    .upload-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      background-color: #10b981 !important;
      color: #ffffff !important;
      border: none;
      border-radius: 8px;
      height: 48px;
    }
    
    .upload-btn:hover {
      background-color: #059669 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }
    
    .upload-btn:disabled {
      background-color: #d1d5db !important;
      color: #9ca3af !important;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-weight: 500;
    }
    
    .results-section {
      background: #ffffff;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .results-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .results-header mat-icon {
      color: #10b981;
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
    }
    
    .results-header h4 {
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
    
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .result-item.success {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    
    .result-item.warning {
      background: #fffbeb;
      border-color: #fed7aa;
    }
    
    .result-item.error {
      background: #fef2f2;
      border-color: #fecaca;
    }
    
    .result-item.info {
      background: #f0f9ff;
      border-color: #bae6fd;
    }
    
    .result-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
    
    .result-content mat-icon {
      font-size: 1.25rem;
    }
    
    .result-item.success .result-content mat-icon {
      color: #10b981;
    }
    
    .result-item.warning .result-content mat-icon {
      color: #f59e0b;
    }
    
    .result-item.error .result-content mat-icon {
      color: #ef4444;
    }
    
    .result-item.info .result-content mat-icon {
      color: #3b82f6;
    }
    
    .resend-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #10b981;
      font-size: 0.875rem;
    }
    
    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-focus-outline-color: #10b981;
      --mdc-outlined-text-field-hover-outline-color: #10b981;
      --mdc-outlined-text-field-label-text-color: #6b7280;
      --mdc-outlined-text-field-input-text-color: #1f2937;
    }
    
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: #d1d5db !important;
    }
    
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #10b981 !important;
    }
    
    ::ng-deep .mat-mdc-select {
      background-color: #ffffff !important;
    }
    
    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .guide-section {
        min-width: unset;
        position: static;
      }
      
      .form-wrapper {
        min-width: unset;
      }
      
      .file-upload {
        flex-direction: column;
        align-items: stretch;
      }
      
      .file-select-btn, .template-btn {
        justify-content: center;
      }
      
      .upload-btn {
        width: 100%;
        justify-content: center;
      }
      
      .result-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      
      .result-actions {
        align-self: flex-end;
      }
      
      .config-row {
        flex-direction: column;
        gap: 1rem;
      }
      
      .role-field {
        max-width: unset;
      }
    }
    
    @media (max-width: 480px) {
      .bulk-invite-container {
        padding: 0 1rem;
      }
      
      .guide-section {
        padding: 1.5rem;
      }
      
      .form-section {
        padding: 1.5rem;
      }
      
      .file-drop-zone {
        padding: 1.5rem;
        flex-direction: column;
        text-align: center;
      }
      
      .upload-text {
        text-align: center;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .guide-section {
        background: #065f46;
        border-color: #047857;
      }
      
      .guide-header h3 {
        color: #6ee7b7;
      }
      
      .step-content h4 {
        color: #6ee7b7;
      }
      
      .step-content p {
        color: #a7f3d0;
      }
      
      .bulk-invite-form {
        background: #1f2937;
        border-color: #374151;
      }
      
      .form-section {
        border-bottom-color: #374151;
      }
      
      .section-title h4 {
        color: #ffffff;
      }
      
      .file-drop-zone {
        background: #374151;
        border-color: #4b5563;
      }
      
      .file-drop-zone:hover {
        background: #4b5563;
        border-color: #10b981;
      }
      
      .upload-text h5 {
        color: #ffffff;
      }
      
      .upload-text p {
        color: #d1d5db;
      }
      
      .upload-icon {
        color: #9ca3af;
      }
      
      .file-drop-zone:hover .upload-icon {
        color: #10b981;
      }
      
      .results-header h4 {
        color: #ffffff;
      }
      
      ::ng-deep .mat-mdc-form-field {
        --mdc-outlined-text-field-label-text-color: #d1d5db;
        --mdc-outlined-text-field-input-text-color: #ffffff;
      }
      
      ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
      ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch,
      ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing {
        border-color: #4b5563 !important;
      }
      
      ::ng-deep .mat-mdc-select {
        background-color: #374151 !important;
        color: #ffffff;
      }
      
      .results-section {
        background: #1f2937;
        border-color: #374151;
      }
      
      .results-section h4 {
        color: #ffffff;
      }
      
      .result-item {
        border-color: #374151;
      }
      
      .result-item.success {
        background: #065f46;
        border-color: #10b981;
      }
      
      .result-item.warning {
        background: #78350f;
        border-color: #f59e0b;
      }
      
      .result-item.error {
        background: #7f1d1d;
        border-color: #ef4444;
      }
      
      .result-item.info {
        background: #1e3a8a;
        border-color: #3b82f6;
      }
      
      .error-message {
        background: #7f1d1d;
        border-color: #ef4444;
        color: #fecaca;
      }
    }
  `]
})
export class BulkInviteComponent {
  RoleType = RoleType;
  file: File | null = null;
  role: RoleType = RoleType.Staff;
  loading = false;
  result: any = null;
  resultList: string[] = [];
  error = '';

  constructor(private auth: AuthService) { }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  upload() {
    if (!this.file) return;
    this.loading = true;
    this.auth.bulkInvite(this.file, this.role).subscribe({
      next: (res) => {
        this.loading = false;
        this.result = res.data ?? res;
        this.resultList = Array.isArray(this.result) ? this.result.map(String) : [String(this.result)];
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Bulk invite failed';
      }
    });
  }

  downloadTemplate() {
    this.loading = true;
    this.auth.downloadBulkInviteTemplate('csv').subscribe({
      next: (blob) => {
        this.loading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-invite-template.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to download template';
      }
    });
  }

  resendFromResult(r: string) {
    const match = r.match(/AlreadySent:\s*([^\s]+)\s*->/);
    const email = match ? match[1] : null;
    if (!email) return;
    this.loading = true;
    this.auth.resendInvite(email, this.role).subscribe({
      next: (res) => {
        this.loading = false;
        // Update the specific entry in resultList
        const idx = this.resultList.indexOf(r);
        if (idx >= 0) this.resultList[idx] = `ReSent: ${email}`;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Resend failed';
      }
    });
  }
  
  getResultClass(result: string): string {
    if (result.startsWith('Success:')) return 'success';
    if (result.startsWith('AlreadySent:')) return 'warning';
    if (result.startsWith('Error:')) return 'error';
    return 'info';
  }
  
  getResultIcon(result: string): string {
    if (result.startsWith('Success:')) return 'check_circle';
    if (result.startsWith('AlreadySent:')) return 'info';
    if (result.startsWith('Error:')) return 'error';
    return 'mail';
  }
}