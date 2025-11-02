'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  Plus,
  Filter
} from 'lucide-react';
import { Action, ACTION_PRIORITIES_DUTCH, ACTION_STATUS_DUTCH } from '@/lib/types';
import { getPriorityColor, getStatusColor, formatDateDutch, getDaysUntilDeadline } from '@/lib/utils';

interface ActionManagementProps {
  actions: Action[];
  onAddAction?: () => void;
  onFilterChange?: (filter: string) => void;
}

export function ActionManagement({ actions, onAddAction, onFilterChange }: ActionManagementProps) {
  const overdueActions = actions.filter(action => 
    action.dueDate && getDaysUntilDeadline(action.dueDate) < 0 && action.status !== 'COMPLETED'
  );
  
  const urgentActions = actions.filter(action => 
    action.priority === 'URGENT' && action.status !== 'COMPLETED'
  );

  const inProgressActions = actions.filter(action => action.status === 'IN_PROGRESS');
  const completedActions = actions.filter(action => action.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Action Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achterstallig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueActions.length}</div>
            <p className="text-xs text-muted-foreground">Acties achterstallig</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{urgentActions.length}</div>
            <p className="text-xs text-muted-foreground">Urgente acties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Uitvoering</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressActions.length}</div>
            <p className="text-xs text-muted-foreground">Acties in uitvoering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedActions.length}</div>
            <p className="text-xs text-muted-foreground">Acties voltooid</p>
          </CardContent>
        </Card>
      </div>

      {/* Action List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Actie Overzicht</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onFilterChange?.('all')}>
                <Filter className="h-4 w-4 mr-2" />
                Alle
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFilterChange?.('overdue')}>
                Achterstallig
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFilterChange?.('urgent')}>
                Urgent
              </Button>
              <Button onClick={onAddAction}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Actie
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.slice(0, 10).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{action.title}</h3>
                    <Badge className={getPriorityColor(action.priority)}>
                      {ACTION_PRIORITIES_DUTCH[action.priority]}
                    </Badge>
                    <Badge className={getStatusColor(action.status)}>
                      {ACTION_STATUS_DUTCH[action.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {action.assignedToId && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Toegewezen aan: {action.assignedToId}</span>
                      </div>
                    )}
                    {action.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Deadline: {formatDateDutch(action.dueDate)}
                          {getDaysUntilDeadline(action.dueDate) < 0 && (
                            <span className="text-red-600 ml-1">(Achterstallig)</span>
                          )}
                        </span>
                      </div>
                    )}
                    {action.cost && (
                      <span>Kosten: €{action.cost.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Bekijk
                  </Button>
                  <Button variant="outline" size="sm">
                    Bewerk
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
