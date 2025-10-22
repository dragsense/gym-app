import { useId } from "react";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User, Users, Edit, Trash2, Eye, Mail, Phone, Link, Copy, ExternalLink, BarChart3 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { type IReferralLink } from "@shared/interfaces/referral-link.interface";
import { EReferralLinkStatus, EReferralLinkType } from "@shared/enums/referral-link.enum";
import type { ColumnDef } from "@tanstack/react-table";

interface IReferralItemViewsProps {
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}

export function referralLinkItemViews({ handleEdit, handleDelete, handleView }: IReferralItemViewsProps) {
  const componentId = useId();

  // Table columns
  const columns: ColumnDef<IReferralLink>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'referralCode',
      header: 'Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Copy className="h-4 w-4 text-muted-foreground" />
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{row.original.referralCode}</code>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const typeColors = {
          [EReferralLinkType.CLIENT]: 'bg-blue-100 text-blue-800',
          [EReferralLinkType.TRAINER]: 'bg-green-100 text-green-800',
          [EReferralLinkType.PARTNER]: 'bg-purple-100 text-purple-800',
          [EReferralLinkType.AFFILIATE]: 'bg-orange-100 text-orange-800',
        };
        
        return (
          <Badge className={typeColors[row.original.type] || 'bg-gray-100 text-gray-800'}>
            {row.original.type.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const referralLink = row.original;
        const statusColors = {
          [EReferralLinkStatus.ACTIVE]: 'bg-green-100 text-green-800',
          [EReferralLinkStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
          [EReferralLinkStatus.EXPIRED]: 'bg-red-100 text-red-800',
          [EReferralLinkStatus.SUSPENDED]: 'bg-yellow-100 text-yellow-800',
        };
        
        return (
          <Badge className={statusColors[referralLink.status] || 'bg-gray-100 text-gray-800'}>
            {referralLink.status.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: 'clickCount',
      header: 'Clicks',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{row.original.clickCount}</span>
        </div>
      ),
    },
    {
      id: 'referralCount',
      header: 'Referrals',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-green-600" />
          <span className="font-medium">{row.original.referralCount}</span>
        </div>
      ),
    },
    {
      id: 'commissionPercentage',
      header: 'Commission',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{row.original.commissionPercentage}%</span>
        </div>
      ),
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original.id)}
            data-component-id={componentId}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
            data-component-id={componentId}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            data-component-id={componentId}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // List item renderer
  const listItem = (referralLink: IReferralLink) => {
    const statusColors = {
      [EReferralLinkStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [EReferralLinkStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [EReferralLinkStatus.EXPIRED]: 'bg-red-100 text-red-800',
      [EReferralLinkStatus.SUSPENDED]: 'bg-yellow-100 text-yellow-800',
    };

    const typeColors = {
      [EReferralLinkType.CLIENT]: 'bg-blue-100 text-blue-800',
      [EReferralLinkType.TRAINER]: 'bg-green-100 text-green-800',
      [EReferralLinkType.PARTNER]: 'bg-purple-100 text-purple-800',
      [EReferralLinkType.AFFILIATE]: 'bg-orange-100 text-orange-800',
    };

    return (
      <AppCard className="p-4 hover:shadow-md transition-shadow" data-component-id={componentId}>
        <div className="space-y-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{referralLink.title}</h3>
              <Badge className={typeColors[referralLink.type] || 'bg-gray-100 text-gray-800'}>
                {referralLink.type.toLowerCase()}
              </Badge>
              <Badge className={statusColors[referralLink.status] || 'bg-gray-100 text-gray-800'}>
                {referralLink.status.toLowerCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span><strong>Code:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{referralLink.referralCode}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span><strong>Clicks:</strong> {referralLink.clickCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span><strong>Referrals:</strong> {referralLink.referralCount}</span>
              </div>
              
              {referralLink.expiresAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span><strong>Expires:</strong> {format(new Date(referralLink.expiresAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span><strong>Link:</strong> <a href={referralLink.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{referralLink.linkUrl}</a></span>
              </div>
            </div>
            
            {referralLink.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {referralLink.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(referralLink.linkUrl)}
              data-component-id={componentId}
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(referralLink.linkUrl, '_blank')}
              data-component-id={componentId}
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(referralLink.id)}
              data-component-id={componentId}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(referralLink.id)}
              data-component-id={componentId}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(referralLink.id)}
              data-component-id={componentId}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AppCard>
    );
  };

  return { columns, listItem };
}
