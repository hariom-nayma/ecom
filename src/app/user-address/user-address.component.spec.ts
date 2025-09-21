import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddressComponent } from './user-address.component';

describe('UserAddressComponent', () => {
  let component: UserAddressComponent;
  let fixture: ComponentFixture<UserAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
