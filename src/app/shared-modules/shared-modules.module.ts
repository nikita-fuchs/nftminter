import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule,  } from '@angular/material/icon';
import {
  NbSpinnerModule,
} from '@nebular/theme';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';


const materialModules = [
  MatIconModule,
  MatInputModule
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...materialModules,
    NbSpinnerModule
  ],
  exports: [
    ...materialModules,
    NbSpinnerModule
  ]
})
export class SharedModulesModule { }
