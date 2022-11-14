import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbComponentSize, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';


@Component({
  selector: 'ngx-security-cameras',
  styleUrls: ['./security-cameras.component.scss'],
  templateUrl: './security-cameras.component.html',
})
export class SecurityCamerasComponent implements OnInit, OnDestroy, OnChanges {
  
  private destroy$ = new Subject<void>();
  
  cameras: Camera[];
  selectedCamera: Camera;
  isSingleView = true;
  actionSize: NbComponentSize = 'medium';
  
  /* NFT info start*/
  @Input() nftBaseUrl : string 
  @Input() nftName : string = ""
  @Input() helpMessage : string = ""

  nftCheckedImageLink = "" // only to be used once the content type of the NFT media query is checked
  // @Output() urlCheckInfo = new EventEmitter<urlCheckInfo>();
  /* NFT info end*/

  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private securityCamerasService: SecurityCamerasData,
  ) {}

  ngOnInit() {
    this.securityCamerasService.getCamerasData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cameras: Camera[]) => {
        this.cameras = cameras;
        this.selectedCamera = this.cameras[0];
      });

    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  ngOnChanges(changes: SimpleChanges) {
    
    if (changes.nftBaseUrl && changes.nftBaseUrl.currentValue !== "" ) {
      fetch("http://95.216.27.196:8081/proxy/" + changes.nftBaseUrl.currentValue , {
      /*   headers: {
          'Access-Control-Allow-Origin':'*'
        } */
      })
   /*    .then((data: any) => {
        console.log(data ? JSON.parse(data) : {})
      })
      .catch((error) => {
        console.log(error)
      })   */
      .then(response => {
        //@ts-ignore
        const contentType = response.headers.get("content-type");
        console.log("content type:", contentType);
        //@ts-ignore
        if (contentType && contentType.indexOf("image/") !== -1) {
          console.log("Found image !");
          this.nftCheckedImageLink = changes.nftBaseUrl.currentValue
        } else {
          console.log("Not an image.");
        }
      }) 
    }

    // console.log(changes);
    // var httpRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    // if(httpRegex.test(changes.nftBaseUrl.currentValue)) {
    //   this.urlCheckInfo.emit({
    //     valid: true,
    //     couldbeLoaded: true //TODO: use fetch APi to check. hardcoded for now
    //   });
    // }  else {
    //   this.urlCheckInfo.emit({
    //     valid: false,
    //     couldbeLoaded: true //TODO: use fetch APi to check. hardcoded for now
    //   });
    // }
    
  }

  selectCamera(camera: any) {
    this.selectedCamera = camera;
    this.isSingleView = true;
  }
  
}

  interface urlCheckInfo {
    valid: boolean,
    couldbeLoaded: boolean
  }
