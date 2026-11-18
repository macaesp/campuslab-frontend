import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../core/services/report.service';
import { KpiSummary } from '../../core/models/audit.model';

describe('Report view with asynchronous data', () => {
  let pending: Subject<KpiSummary>;
  let service: { getKpis: ReturnType<typeof vi.fn>; getTopResources: ReturnType<typeof vi.fn>; getBookingsByHour: ReturnType<typeof vi.fn> };
  const kpis: KpiSummary = { reservasHoy: 3, ocupacionPromedio: null, tiempoCicloPromedioMin: null,
    labsActivos: 0, ciclosCompletados: 0, catalogAvailable: false, periodStart: '', periodEnd: '', coverageStartedAt: null, lastEventAt: null };

  beforeEach(() => {
    pending = new Subject<KpiSummary>();
    service = { getKpis: vi.fn(() => pending), getTopResources: vi.fn(() => of([])), getBookingsByHour: vi.fn(() => of([])) };
    TestBed.configureTestingModule({ imports: [ReportsComponent], providers: [{ provide: ReportService, useValue: service }] });
  });

  it('renders asynchronous results and distinguishes unavailable metrics from zero', async () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    fixture.detectChanges();
    await Promise.resolve();
    pending.next(kpis); pending.complete();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Solicitudes · últimas 24 h');
    expect(text).toContain('Sin datos'); expect(text).toContain('Sin devoluciones');
    expect(text).toContain('Catálogo no está disponible');
    expect(text).not.toContain('Cargando indicadores');
  });

  it('shows a failure and retries with fresh requests', async () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    fixture.detectChanges(); await Promise.resolve();
    pending.error(new Error('unavailable'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    service.getKpis.mockReturnValue(of(kpis));
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(service.getKpis).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
