import { Component } from '@angular/core';
import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-form-layouts',
  styleUrls: ['./form-layouts.component.scss'],
  templateUrl: './form-layouts.component.html',
})
export class FormLayoutsComponent {

  /* view-related start */
  isSingleView : boolean;
  actionSize = 'medium';


  private destroy$ = new Subject<void>();
  cameras: Camera[];
  selectedCamera: Camera;
 /* view-related end  */


  /* dApp related start */
  nftData: FormGroup;
  contractTypeOption = 'basic' // needs to correspond the default active contract type
  contractTypes = [
    { label: 'Basic NFT', value: 'basic', checked: true },
    { label: 'Mintable / Burnable', value: 'mintable' },
  ];

  nftName : string;
  nftBaseUrl : string;
  nftSymbol : string;

  /* dApp related end  */

  constructor(
    private securityCamerasService: SecurityCamerasData,
  ){
    this.isSingleView = true;
  }

  ngOnInit() {
    this.nftData = new FormGroup({
      nftName: new FormControl("", [Validators.required]),
      nftBaseUrl: new FormControl("", [Validators.required, this.urlRegexCheck()]),
      nftSymbol: new FormControl("", [Validators.required]),
    })

    // setInterval(()=> {console.log(this.contractTypeOption)},3000)

    this.securityCamerasService.getCamerasData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cameras: Camera[]) => {
        this.cameras = cameras;
        this.selectedCamera = this.cameras[0];
      });

      /* setInterval(() => {console.log(this.nftData)}, 3000) */
  }

  log(event){
    console.log("Form group: ", event)
  }

  // setContractTypeOptionChecked(option){
  //   this.
  // }

  urlRegexCheck(): ValidatorFn {
    return (control:AbstractControl) : { [key: string]: any } | null => {
        const value = control.value;

        if (!value) {
            return null;
        }

        const isUrl = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(value);
        return !isUrl ? {malformattedUrl: value}: null;
    }
  }


}
