import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor } from './doctor.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  services = [
    {
      icon: 'fas fa-calendar-check',
      title: 'Appointment Booking',
      description: 'Easy online appointment scheduling with your preferred doctors'
    },
    {
      icon: 'fas fa-user-md',
      title: 'Expert Doctors',
      description: 'Qualified medical professionals with years of experience'
    },
    {
      icon: 'fas fa-heartbeat',
      title: 'Health Monitoring',
      description: 'Comprehensive health tracking and medical record management'
    },
    {
      icon: 'fas fa-pills',
      title: 'Prescription Management',
      description: 'Digital prescriptions and medication tracking system'
    }
  ];

  doctors: Doctor[] = [];
  loading = false;

  constructor(
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        if (response.success) {
          this.doctors = response.data || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  getDicebarAvatar(name: string): string {
    const initials = name.split(' ').map(n => n[0]).join('');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=10b981&textColor=ffffff`;
  }

  onImageError(event: any, name: string) {
    event.target.src = this.getDicebarAvatar(name);
  }
}
