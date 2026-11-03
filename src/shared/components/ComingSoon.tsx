import { Construction } from 'lucide-react'
import { Badge, Card, CardContent } from '@/shared/ui'
import { PageHeader } from './PageHeader'

/** Gabarit pour les rubriques à développer par l'équipe (portails référent / admin). */
export function ComingSoon({ title, description, features }: { title: string; description: string; features: string[] }) {
  return (
    <div>
      <PageHeader eyebrow="À développer" title={title} description={description} />
      <Card className="bg-grid border-dashed text-muted-foreground/60">
        <CardContent className="p-6 text-foreground">
          <div className="mb-4 flex items-center gap-2">
            <Construction className="size-5 text-warning" />
            <span className="font-bold">Périmètre fonctionnel prévu</span>
            <Badge variant="warning">Squelette</Badge>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="rounded-lg border bg-card px-3 py-2 text-sm">
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
