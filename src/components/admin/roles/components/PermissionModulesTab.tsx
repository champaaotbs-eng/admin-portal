import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { MOCK_PERMISSION_MODULES } from '@/data/mock-extended'
import { HTTP_METHOD_COLORS } from '@/constants/colors'

export const PermissionModulesTab = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('system_modules_description')}</p>
            <div className="space-y-4">
                {MOCK_PERMISSION_MODULES.map(module => (
                    <div key={module.id} className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border">
                            <Lock className="h-4 w-4 text-primary" />
                            <div>
                                <p className="font-semibold text-sm">{module.name}</p>
                                <p className="text-xs text-muted-foreground">{module.description}</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {t('module_permissions_count', { count: module.permissions.length })}
                            </Badge>
                        </div>
                        <div className="divide-y divide-border">
                            {module.permissions.map((perm, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <span className={cn(
                                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold',
                                        HTTP_METHOD_COLORS[perm.method as keyof typeof HTTP_METHOD_COLORS] ?? 'bg-muted text-muted-foreground',
                                    )}>
                                        {perm.method}
                                    </span>
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                        {perm.path}
                                    </code>
                                    <span className="text-muted-foreground text-xs ml-auto">{perm.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
