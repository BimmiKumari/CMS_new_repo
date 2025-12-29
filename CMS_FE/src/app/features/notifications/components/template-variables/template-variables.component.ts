import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TemplateVariablesService } from '../../../../core/services/template-variables.service';

@Component({
  selector: 'app-template-variables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './template-variables.component.html',
  styleUrls: ['./template-variables.component.css']
})
export class TemplateVariablesComponent implements OnInit, OnChanges {
  @Input() variables: string[] = [];
  @Input() type: 'email' | 'sms' = 'email';
  @Output() variablesChanged = new EventEmitter<{[key: string]: string}>();
  variablesForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private templateVarsService: TemplateVariablesService
  ) {
    this.variablesForm = this.fb.group({});
  }

  ngOnInit() {
    this.createFormControls();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['variables']) {
      this.createFormControls();
    }
  }

  private createFormControls() {
    // Clear existing controls
    Object.keys(this.variablesForm.controls).forEach(key => {
      this.variablesForm.removeControl(key);
    });

    // Create new controls
    this.variables.forEach(variable => {
      this.variablesForm.addControl(variable, this.fb.control(''));
    });
  }

  getVariableLabel(variable: string): string {
    return this.templateVarsService.formatVariableName(variable);
  }

  /**
   * Return an appropriate input type based on the variable name.
   * - variables containing 'date' -> date
   * - variables containing 'time' -> time
   * - otherwise -> text
   */
  getInputType(variable: string): string {
    const v = (variable || '').toLowerCase();
    if (v.includes('date')) return 'date';
    if (v.includes('time')) return 'time';
    return 'text';
  }

  getVariableValue(variable: string): string {
    return this.variablesForm.get(variable)?.value || '';
  }

  getAllValues(): { [key: string]: string } {
    return this.variablesForm.value;
  }

  onVariableChange(): void {
    this.variablesChanged.emit(this.getAllValues());
  }
}