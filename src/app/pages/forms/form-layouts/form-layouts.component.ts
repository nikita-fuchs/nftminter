import { Component } from '@angular/core';
import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AeternityService } from '../../../services/aeternity.service';
// import { aex141nft } from '../../../interfaces/NFT';
import { aex141nftContract } from '../../../../assets/contracts/aex141-nft-collection-example/MintableMappedMetadataNFT-flattened.aes'

@Component({
  selector: 'ngx-form-layouts',
  styleUrls: ['./form-layouts.component.scss'],
  templateUrl: './form-layouts.component.html',
})
export class FormLayoutsComponent {

  /* view-related start */
  isSingleView : boolean;
  actionSize = 'medium';
  showSpinnerOnMintButton = false;

  private destroy$ = new Subject<void>();
  cameras: Camera[];
  selectedCamera: Camera;
 /* view-related end  */


  /* dApp related start */
  nftData: UntypedFormGroup;
  contractTypeOption = 'basic' // needs to correspond the default active contract type
  contractTypes = [
    { label: 'Basic NFT', value: 'basic', checked: true },
    { label: 'Mintable / Burnable', value: 'mintable' },
  ];


  /* dApp related end  */

  constructor(
    private securityCamerasService: SecurityCamerasData,
    public aeService: AeternityService 
  ){
    this.isSingleView = true; // UI

/*     const onNetworkChange = (params : any ) => {
      // TODO: Make a toast for network changes
      // TODO: Display warning when on wrong network
      console.log("Network change:", params.networkId);
    }; */

  /*   aeService.initSDK(onNetworkChange)
      .then( async ({walletNetworkId, aeSdk} : {walletNetworkId: string, aeSdk: any}) => {
        this.aeSdk = aeSdk;
        console.log("Initialised sdk");
        const test = await this.aeService.showWalletInfo(walletNetworkId);

    }); */
  }

  ngOnInit() {
    this.nftData = new UntypedFormGroup({
      nftName: new UntypedFormControl("", [Validators.required]),
      nftBaseUrl: new UntypedFormControl("", [Validators.required, this.urlRegexCheck()]),
      nftSymbol: new UntypedFormControl("", [Validators.required]),
      nftDescription: new UntypedFormControl("", [Validators.required]),
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


  async mint() {

    this.aeService.deployedNftAddress = ''
    this.showSpinnerOnMintButton = true;
    // TODO mint multiple NFTs; 
    // MVP - mint only one NFT into the new contract
    const nfts = [
      {
        "name": this.nftData.get('nftName').value,
        "description": this.nftData.get('nftDescription').value,
        "media_type": "IMAGE",
        "media_url": this.nftData.get('nftBaseUrl').value
      }
    ];
/*     const nfts : Array<aex141nft> = [
      {
        "name": this.nftData.get('nftName').value,
        "description": this.nftData.get('nftDescription').value,
        "media_type": "IMAGE",
        "media_url": this.nftData.get('nftBaseUrl').value,
        "immutable_attributes": {
            "apes_count": 2,
            "moon_visible": true
        },
        "mutable_attributes": {
            "retries": 0
        }
      }
    ]; */

    const senderAddress = await this.aeService.sdkState.address;

    // const CONTRACT = './../../../../assets/contracts/aex141-nft-collection-example/MintableMappedMetadataNFT-flattened.aes';
    const source = aex141nftContract;

    console.log("Compiling....");
    const contract = await this.aeService.aeSdk.getContractInstance({ source });
    debugger

    // deploy
    console.log("Deploying with: ",this.nftData.get('nftBaseUrl').value, this.nftData.get('nftSymbol').value, 1);
    //debugger
    await contract.deploy([
      this.nftData.get('nftName').value,
      this.nftData.get('nftSymbol').value,
      1 // "token limit - harcode for now
    ]); 

/*     await contract.deploy([
        "Test",
        "Test"
    ]); */

 
    console.log(`Contract successfully deployed!`);
    console.log(`Contract address: ${contract.deployInfo.address}`);
    console.log(`Tx-Hash: ${contract.deployInfo.txData.hash}`);
    console.log(`Gas used: ${contract.deployInfo.result.gasUsed}`);
    console.log(`------------------------------------------------------------------------------------------`);
    console.log(`------------------------------------------------------------------------------------------`);

    // mint
    for(let i=0; i<nfts.length; i++) {
        const nftMetadataMapStringValues = new Map(Object.entries(nfts[i]).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : v]));
        console.log("Feeding the contract:", nftMetadataMapStringValues)
        const tx = await contract.methods.mint(
            senderAddress,
            {'MetadataMap': [nftMetadataMapStringValues]}
        );
        console.log(`Minted '${nftMetadataMapStringValues.get('name')}' with id '${tx.decodedResult}'`);
        console.log(`Tx-Hash: ${tx.hash}`);
        console.log(`Gas used: ${tx.result.gasUsed}`);
        console.log(`------------------------------------------------------------------------------------------`);
        console.log(`------------------------------------------------------------------------------------------`);
    };
    this.aeService.deployedNftAddress = contract.deployInfo.address;
    this.showSpinnerOnMintButton = false;

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
