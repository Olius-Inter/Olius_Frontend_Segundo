import { CalendarDays, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { useCalendar } from '../../hooks/useCalendar'
import CalendarBoard from '../../components/CalendarBoard'
import CalendarDay from '../../components/CalendarDay'
import ScheduleDialog from '../../components/ScheduleDialog'
import { AdminTabs } from '../../../admin-records'
import PageFeedback from '../../../../shared/ui/PageFeedback'
import { brasiliaDate } from '../../../../shared/lib/date'
import styles from './styles.module.css'

export default function AgendaPage() {
  const {
    state,
    reload,
    month,
    selected,
    setSelected,
    view,
    setView,
    event,
    setEvent,
    move,
    current,
    saved,
    message,
  } = useCalendar()
  const result = state.phase === 'ready' ? state.data : null
  const data = result?.kind === 'ready' ? result.data : null
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`))
  return (
    <div className={styles.page}>
      <header>
        <h1>Agenda de coletas</h1>
        <p>Coletas programadas após o contato externo com cada estabelecimento.</p>
      </header>
      <AdminTabs area="operacao" />
      <div className={styles.toolbar}>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Mês anterior">
            <ChevronLeft size={18} />
          </button>
          <h2>{label}</h2>
          <button type="button" onClick={() => move(1)} aria-label="Próximo mês">
            <ChevronRight size={18} />
          </button>
          <button type="button" onClick={current}>
            Hoje
          </button>
        </div>
        <div role="group" aria-label="Visualização da agenda">
          <button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>
            <CalendarDays size={17} aria-hidden="true" />
            Mês
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List size={17} aria-hidden="true" />
            Lista
          </button>
        </div>
      </div>
      {message && <p role="status">{message}</p>}
      {state.phase === 'loading' && (
        <PageFeedback
          kind="loading"
          title="Carregando agenda"
          description="Consultando todas as visitas do intervalo visível."
        />
      )}
      {state.phase === 'error' && (
        <PageFeedback
          kind="error"
          title="Não foi possível consultar a agenda"
          description={state.message}
        >
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </PageFeedback>
      )}
      {result?.kind === 'unavailable' && (
        <PageFeedback
          kind="empty"
          title="Agenda aguardando integração"
          description={result.message}
        />
      )}
      {data && (
        <>
          {!data.complete && (
            <p role="status">
              A consulta está parcial: {data.events.length} de {data.total} visitas. Não interprete
              dias sem marcadores como livres.
            </p>
          )}
          {view === 'month' ? (
            <CalendarBoard
              events={data.events}
              month={month}
              selected={selected}
              onSelectDay={setSelected}
              onSelectEvent={setEvent}
            />
          ) : (
            <div className={styles.days}>
              {[...new Set(data.events.map((e) => brasiliaDate(e.startsAt)))].sort().map((day) => (
                <CalendarDay key={day} events={data.events} date={day} onSelectEvent={setEvent} />
              ))}
              {!data.events.length && <p>Nenhuma visita retornada para o período.</p>}
            </div>
          )}
          {view === 'month' && (
            <CalendarDay events={data.events} date={selected} onSelectEvent={setEvent} />
          )}
        </>
      )}
      <p className={styles.note}>
        Horários em Brasília. Coincidências são sinalizadas para consulta; a organização da
        logística permanece externa.
      </p>
      <ScheduleDialog event={event} onClose={() => setEvent(null)} onSaved={saved} />
    </div>
  )
}
