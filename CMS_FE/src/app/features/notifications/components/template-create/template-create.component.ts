import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-template-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Create Notification Template</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="save()" #templateForm="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Template Name</mat-label>
            <input matInput [(ngModel)]="model.name" name="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Channel Type</mat-label>
            <mat-select [(ngModel)]="model.channelType" name="channelType" required>
              <mat-option [value]="0">Email</mat-option>
              <mat-option [value]="1">SMS</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="model.category" name="category" required>
              <mat-option [value]="0">Appointment</mat-option>
              <mat-option [value]="1">Reminder</mat-option>
              <mat-option [value]="2">Billing</mat-option>
              <mat-option [value]="3">General</mat-option>
              <mat-option [value]="4">Emergency</mat-option>
              <mat-option [value]="5">System</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Subject</mat-label>
            <input matInput [(ngModel)]="model.subject" name="subject">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Template Body</mat-label>
            <textarea matInput [(ngModel)]="model.body" name="body" rows="6" required></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Variables (comma separated)</mat-label>
            <input matInput [(ngModel)]="model.variables" name="variables" 
                   placeholder="patientName, appointmentDate, doctorName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <input matInput [(ngModel)]="model.description" name="description">
          </mat-form-field>

          <mat-checkbox [(ngModel)]="model.isActive" name="isActive" class="full-width">
            Active Template
          </mat-checkbox>

          <div class="button-row">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!templateForm.valid || saving">
              <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
              Create Template
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .button-row {
      margin-top: 20px;
    }
    mat-spinner {
      margin-right: 10px;
    }
  `]
})
export class TemplateCreateComponent {
  model: any = { 
    name: '', 
    subject: '', 
    body: '', 
    variables: '', 
    description: '', 
    isActive: true, 
    type: 100, 
    channelType: 0, 
    category: 5 
  };
  saving = false;

  constructor(private notificationService: NotificationService) { }

  save() {
    this.saving = true;
    this.notificationService.createTemplate(this.model).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          alert('Template created successfully');
          this.resetForm();
        } else {
          alert(response.message || 'Error creating template');
        }
      },
      error: (error) => {
        console.error(error);
        this.saving = false;
        alert(error.message || 'Error creating template');
      }
    });
  }

  private resetForm() {
    this.model = {
      name: '', 
      subject: '', 
      body: '', 
      variables: '', 
      description: '', 
      isActive: true, 
      type: 100, 
      channelType: 0, 
      category: 5
    };
  }
}
