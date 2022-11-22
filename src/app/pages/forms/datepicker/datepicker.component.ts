import { Component } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { AeternityService } from '../../../services/aeternity.service';

@Component({
  selector: 'ngx-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
})
export class DatepickerComponent {
  
  min: Date;
  max: Date;

  nfts =
  [{
    nftBaseUrl: 'https://www.tierfreund.de/wp-content/uploads/2016/09/1.jpg',
    nftName: 'Test'
    }];

    
  constructor(protected dateService: NbDateService<Date>, aeService: AeternityService) {
    this.min = this.dateService.addDay(this.dateService.today(), -5);
    this.max = this.dateService.addDay(this.dateService.today(), 5);

/*     setTimeout(() => {
  aeService.readNftDataFrom("ct_2GXBBp9BdAytxRPDYropAKUQJxgeZBiufuktBbPxB3dk2JGUWR")
  
}, 3000); */

  }
}
