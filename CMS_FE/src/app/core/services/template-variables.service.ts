import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemplateVariablesService {
  private defaultVariables = [
    'PatientName',
    'AppointmentDate',
    'AppointmentTime',
    'DoctorName'
  ];

  getTemplateVariables(template: string): string[] {
    if (!template) return [];
    // Extract variables from template text using regex
    // Support both {Var} and {{Var}} styles and allow optional whitespace
    const regex = /{{\s*(\w+)\s*}}|{\s*(\w+)\s*}/g;
    const matches = [...template.matchAll(regex)];
    const variables = matches.map(match => match[1] || match[2]).filter(Boolean as any);
    // Remove duplicates and sort
    return [...new Set(variables)].sort();
  }

  parseTemplate(template: string, variables: { [key: string]: string }): string {
    if (!template) return '';
    let result = template;
    // Replace both {{Var}} and {Var} occurrences with provided values
    const templateVars = this.getTemplateVariables(template);
    templateVars.forEach(key => {
      const value = variables && variables[key] !== undefined && variables[key] !== null ? variables[key] : `{${key}}`;
      // replace {{Var}} and {Var}
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
      result = result.replace(new RegExp(`{\\s*${key}\\s*}`, 'g'), value);
    });
    return result;
  }

  formatVariableName(name: string): string {
    // Convert camelCase or snake_case to Title Case with spaces
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}