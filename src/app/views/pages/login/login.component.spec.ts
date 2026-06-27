import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { ButtonModule, CardModule, FormModule, GridModule } from '@coreui/angular';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { iconSubset } from '../../../icons/icon-subset';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormModule, CardModule, GridModule, ButtonModule, IconModule, LoginComponent],
      providers: [
        IconSetService,
        {
          provide: AuthService,
          useValue: {
            login: jasmine.createSpy('login').and.returnValue(Promise.resolve(null))
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jasmine.createSpy('navigateByUrl')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    iconSetService = TestBed.inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when password is invalid', async () => {
    component.usuario = 'admin';
    component.senha = 'senha-errada';

    await component.entrar();

    expect(component.erro).toBe('Usuário ou senha inválidos.');
    expect(component.carregando).toBeFalse();
  });
});
