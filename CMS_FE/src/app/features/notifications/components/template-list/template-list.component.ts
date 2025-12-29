import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Notification Templates</mat-card-title>
        <mat-card-subtitle>Manage existing templates</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading templates...</p>
        </div>

        <div *ngIf="!loading && templates.length === 0" class="no-data">
          <p>No templates found. Create your first template!</p>
        </div>

        <div *ngIf="!loading && templates.length > 0">
          <table mat-table [dataSource]="templates" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let template">{{template.name}}</td>
            </ng-container>

            <ng-container matColumnDef="channelType">
              <th mat-header-cell *matHeaderCellDef>Channel</th>
              <td mat-cell *matCellDef="let template">
                {{template.channelType === 0 ? 'Email' : 'SMS'}}
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let template">
                {{getCategoryName(template.category)}}
              </td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let template">
                <span [class]="template.isActive ? 'status-active' : 'status-inactive'">
                  {{template.isActive ? 'Active' : 'Inactive'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let template">
                <button mat-icon-button color="primary" (click)="edit(template)" 
                        [disabled]="editTemplate?.id === template.id">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(template.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Edit Form -->
        <mat-card *ngIf="editTemplate" class="edit-form">
          <mat-card-header>
            <mat-card-title>Edit Template: {{editTemplate.name}}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="saveEdit()" #editForm="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Template Name</mat-label>
                <input matInput [(ngModel)]="editTemplate.name" name="name" required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Subject</mat-label>
                <input matInput [(ngModel)]="editTemplate.subject" name="subject">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Template Body</mat-label>
                <textarea matInput [(ngModel)]="editTemplate.body" name="body" rows="6"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Variables</mat-label>
                <input matInput [(ngModel)]="editTemplate.variables" name="variables">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="editTemplate.description" name="description">
              </mat-form-field>

              <mat-checkbox [(ngModel)]="editTemplate.isActive" name="isActive" class="full-width">
                Active Template
              </mat-checkbox>

              <div class="button-row">
                <button mat-raised-button color="primary" type="submit" [disabled]="savingEdit">
                  <mat-spinner *ngIf="savingEdit" diameter="20"></mat-spinner>
                  Save Changes
                </button>
                <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .loading-container {
      text-align: center;
      padding: 40px;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .edit-form {
      margin-top: 20px;
    }
    .button-row {
      margin-top: 20px;
    }
    .button-row button {
      margin-right: 10px;
    }
    .status-active {
      color: #4caf50;
      font-weight: 500;
    }
    .status-inactive {
      color: #f44336;
      font-weight: 500;
    }
    mat-form-field {
      margin-bottom: 15px;
    }
    mat-spinner {
      margin-right: 10px;
    }
  `]
})
export class TemplateListComponent implements OnInit {
  templates: any[] = [];
  loading = false;
  editTemplate: any = null;
  savingEdit = false;
  displayedColumns: string[] = ['name', 'channelType', 'category', 'isActive', 'actions'];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.notificationService.getAllTemplates().subscribe({
      next: (response: any) => {
        this.templates = response.success ? response.data || [] : [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
        alert(error.message || 'Error loading templates');
      }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this template?')) return;
    this.notificationService.deleteTemplate(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.fetch();
        } else {
          alert(response.message || 'Error deleting template');
        }
      },
      error: (error) => {
        console.error(error);
        alert(error.message || 'Error deleting template');
      }
    });
  }

  edit(template: any) {
    this.editTemplate = { ...template };
  }

  cancelEdit() {
    this.editTemplate = null;
  }

  saveEdit() {
    if (!this.editTemplate) return;
    this.savingEdit = true;
    this.notificationService.updateTemplate(this.editTemplate.id, this.editTemplate).subscribe({
      next: (response) => {
        this.savingEdit = false;
        if (response.success) {
          this.editTemplate = null;
          this.fetch();
        } else {
          alert(response.message || 'Error updating template');
        }
      },
      error: (error) => {
        this.savingEdit = false;
        console.error(error);
        alert(error.message || 'Error updating template');
      }
    });
  }

  getCategoryName(category: number): string {
    const categories = {
      0: 'Appointment',
      1: 'Reminder', 
      2: 'Billing',
      3: 'General',
      4: 'Emergency',
      5: 'System'
    };
    return categories[category as keyof typeof categories] || 'Unknown';
  }
}
