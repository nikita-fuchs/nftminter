import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule, NbIconModule, NbLayoutModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbPopoverModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './forms.component';
import { FormInputsComponent } from './form-inputs/form-inputs.component';
import { MaterialInputsComponent } from './form-inputs/material-inputs/material-inputs.component';
import { FormLayoutsComponent } from './form-layouts/form-layouts.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { MaterialButtonsComponent } from './buttons/material-buttons/material-buttons.component';
import { FormsModule as ngFormsModule } from '@angular/forms';
import { StatusCardComponent } from '../dashboard/status-card/status-card.component';

import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ReactiveFormsModule } from '@angular/forms';
/* import { SecurityCamerasComponent } from './security-cameras/security-cameras.component'; */
import { DashboardModule } from '../dashboard/dashboard.module'
import { SharedModulesModule } from '../../shared-modules/shared-modules.module';
//import { SecurityCamerasComponent } from '../dashboard/dashboard.module'


const materialModules = [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatButtonModule,
  MatButtonToggleModule,
];

@NgModule({
  imports: [
    ReactiveFormsModule,
    NbPopoverModule,
    ThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    FormsRoutingModule,
    NbSelectModule,
    NbIconModule,
    ngFormsModule,
    DashboardModule,
    ...materialModules,
    SharedModulesModule
  ],
  declarations: [
    FormsComponent,
    ButtonsComponent,
    FormInputsComponent,
    FormLayoutsComponent,
    DatepickerComponent,
    MaterialInputsComponent,
    MaterialButtonsComponent,
  ],
})
export class FormsModule { }
