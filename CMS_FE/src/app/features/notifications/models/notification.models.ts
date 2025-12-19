export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  type: NotificationType;
  channelType: NotificationChannelType;
  category: NotificationCategory;
  variables?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface CreateNotificationTemplateDto {
  name: string;
  subject?: string;
  body: string;
  type: NotificationType;
  channelType: NotificationChannelType;
  category: NotificationCategory;
  variables?: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateNotificationTemplateDto {
  id: string;
  name: string;
  subject?: string;
  body: string;
  type: NotificationType;
  channelType: NotificationChannelType;
  category: NotificationCategory;
  variables?: string;
  description?: string;
  isActive: boolean;
}

export interface SendNotificationDto {
  templateId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  variables?: { [key: string]: any };
}

export interface SendNotificationByTypeDto {
  type: NotificationType;
  channelType: NotificationChannelType;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  variables?: { [key: string]: any };
}

export enum NotificationType {
  AppointmentConfirmation = 0,
  AppointmentReminder = 1,
  AppointmentCancellation = 2,
  AppointmentRescheduled = 3,
  PaymentConfirmation = 4,
  PaymentReminder = 5,
  WelcomeMessage = 6,
  PasswordReset = 7,
  AccountActivation = 8,
  SystemMaintenance = 9,
  Custom = 100
}

export enum NotificationChannelType {
  Email = 0,
  SMS = 1,
  Push = 2,
  InApp = 3
}

export enum NotificationCategory {
  Appointment = 0,
  Reminder = 1,
  Billing = 2,
  General = 3,
  Emergency = 4,
  System = 5
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}