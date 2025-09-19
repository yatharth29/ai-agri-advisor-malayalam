"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  UserPen, 
  LandPlot, 
  Crop, 
  Contact, 
  MessageCircleQuestionMark,
  PanelLeftClose,
  SkipBack,
  IdCard
} from 'lucide-react';
import { useI18n } from "@/lib/i18n";

interface Plot {
  id: string;
  name: string;
  crops: string[];
  soilType: string;
  area: string;
}

interface Query {
  id: string;
  question: string;
  status: 'answered' | 'escalated' | 'pending';
  timestamp: string;
}

interface FarmerProfile {
  name: string;
  avatar?: string;
  location: string;
  language: string;
  phone: string;
}

interface FarmerSidebarProps {
  className?: string;
  onPlotSelect?: (plotId: string) => void;
  onCropSelect?: (crop: string) => void;
}

export default function FarmerSidebar({ className, onPlotSelect, onCropSelect }: FarmerSidebarProps) {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [recentQueries, setRecentQueries] = useState<Query[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAddPlot, setShowAddPlot] = useState(false);
  const [showHelpCard, setShowHelpCard] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>('');
  const { t, language } = useI18n();

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile({
        name: 'രാജേഷ് കുമാർ',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        location: 'കൊച്ചി, കേരളം',
        language: 'മലയാളം',
        phone: '+91 9876543210'
      });

      setPlots([
        {
          id: '1',
          name: 'തെക്കൻ കൃഷിയിടം',
          crops: ['നെല്ല്', 'തേങ്ങ'],
          soilType: 'കളിമണ്ണ്',
          area: '2.5 ഏക്കർ'
        },
        {
          id: '2',
          name: 'വടക്കൻ തോട്ടം',
          crops: ['കുരുമുളക്', 'ഏലം'],
          soilType: 'കരിമണ്ണ്',
          area: '1.8 ഏക്കർ'
        }
      ]);

      setRecentQueries([
        {
          id: '1',
          question: 'നെല്ലിന് മഞ്ഞളിപ്പ് വരുന്നു',
          status: 'answered',
          timestamp: '2 മണിക്കൂർ മുമ്പ്'
        },
        {
          id: '2',
          question: 'കുരുമുളകിന്റെ വിളവ് കുറയുന്നു',
          status: 'pending',
          timestamp: '1 ദിവസം മുമ്പ്'
        },
        {
          id: '3',
          question: 'മണ്ണിന്റെ pH എങ്ങനെ പരിശോധിക്കാം?',
          status: 'escalated',
          timestamp: '3 ദിവസം മുമ്പ്'
        }
      ]);

      const locale = language === "ml" ? "ml-IN" : language === "hi" ? "hi-IN" : "en-IN";
      setLastSynced(new Date().toLocaleString(locale));
      setIsLoading(false);
    };

    loadData();
  }, [language]);

  const savedCrops = ['നെല്ല്', 'തേങ്ങ', 'കുരുമുളക്', 'ഏലം', 'കാപ്പി', 'റബ്ബർ'];

  const handlePlotSelect = (plotId: string) => {
    setSelectedPlot(plotId);
    onPlotSelect?.(plotId);
  };

  const handleCropSelect = (crop: string) => {
    onCropSelect?.(crop);
  };

  const getStatusColor = (status: Query['status']) => {
    switch (status) {
      case 'answered':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'escalated':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: Query['status']) => {
    switch (status) {
      case 'answered':
        return t('sidebar_status_answered');
      case 'pending':
        return t('sidebar_status_pending');
      case 'escalated':
        return t('sidebar_status_escalated');
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-sidebar text-sidebar-foreground p-4 space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="bg-sidebar-accent rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sidebar-border rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-sidebar-border rounded w-24"></div>
                <div className="h-3 bg-sidebar-border rounded w-20"></div>
              </div>
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-sidebar-accent rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-sidebar text-sidebar-foreground ${className}`}>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Profile Card */}
          {profile && (
            <Card className="bg-sidebar-accent border-sidebar-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sidebar-foreground truncate">{profile.name}</p>
                    <p className="text-sm text-sidebar-foreground/70">{profile.location}</p>
                    <p className="text-xs text-sidebar-foreground/60">{profile.language}</p>
                  </div>
                </div>
                <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-sidebar-border">
                      <UserPen className="w-4 h-4 mr-2" />
                      {t('edit_profile')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>{t('edit_profile')}</DialogTitle>
                      <DialogDescription>{t('update_info')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input id="name" defaultValue={profile.name} />
                      </div>
                      <div>
                        <Label htmlFor="location">{t('location_label')}</Label>
                        <Input id="location" defaultValue={profile.location} />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input id="phone" defaultValue={profile.phone} />
                      </div>
                      <Button className="w-full">{t('save_btn')}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Farms/Plots */}
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sidebar-foreground flex items-center justify-between">
                <div className="flex items-center">
                  <LandPlot className="w-4 h-4 mr-2" />
                  {t('plots')}
                </div>
                <Dialog open={showAddPlot} onOpenChange={setShowAddPlot}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border">
                      + {t('add')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>{t('add_new_plot')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="plotName">{t('plot_name')}</Label>
                        <Input id="plotName" placeholder="ഉദാ: തെക്കൻ കൃഷിയിടം" />
                      </div>
                      <div>
                        <Label htmlFor="crops">{t('crops_label')}</Label>
                        <Input id="crops" placeholder="ഉദാ: നെല്ല്, തേങ്ങ" />
                      </div>
                      <div>
                        <Label htmlFor="soilType">{t('soil_type')}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_soil_type')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clay">{t('clay')}</SelectItem>
                            <SelectItem value="sandy">{t('sandy')}</SelectItem>
                            <SelectItem value="loamy">{t('loamy')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="area">{t('area')}</Label>
                        <Input id="area" placeholder="ഉദാ: 2.5 ഏക്കർ" />
                      </div>
                      <Button className="w-full">{t('add_btn')}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {plots.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-sidebar-foreground/70 mb-2">{t('no_plots')}</p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPlot(true)} className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-sidebar-border">
                    {t('add_first_plot')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {plots.map((plot) => (
                    <div
                      key={plot.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedPlot === plot.id
                          ? 'bg-sidebar-primary border-sidebar-ring text-sidebar-primary-foreground'
                          : 'bg-sidebar-background/50 border-sidebar-border hover:bg-sidebar-background/70 text-sidebar-foreground'
                      }`}
                      onClick={() => handlePlotSelect(plot.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{plot.name}</h4>
                        <span className="text-xs opacity-70">{plot.area}</span>
                      </div>
                      <p className="text-xs opacity-70 mb-1">{t('crops_label')}: {plot.crops.join(', ')}</p>
                      <p className="text-xs opacity-70">{plot.soilType}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Crops */}
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sidebar-foreground flex items-center">
                <Crop className="w-4 h-4 mr-2" />
                {t('favorite_crops')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {savedCrops.map((crop) => (
                  <Badge
                    key={crop}
                    variant="secondary"
                    className="cursor-pointer hover:bg-sidebar-primary hover:text-sidebar-primary-foreground bg-sidebar-background/50 text-sidebar-foreground border-sidebar-border"
                    onClick={() => handleCropSelect(crop)}
                  >
                    {crop}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sidebar-foreground flex items-center">
                <MessageCircleQuestionMark className="w-4 h-4 mr-2" />
                {t('recent_questions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {recentQueries.map((query) => (
                  <div key={query.id} className="p-2 rounded-lg bg-sidebar-background/50 border border-sidebar-border hover:bg-sidebar-background/70 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs text-sidebar-foreground line-clamp-2 flex-1">{query.question}</p>
                      <Badge className={`ml-2 text-xs ${getStatusColor(query.status)}`}>
                        {getStatusText(query.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-sidebar-foreground/60">{query.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact Actions */}
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sidebar-foreground flex items-center">
                <Contact className="w-4 h-4 mr-2" />
                {t('help')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-sidebar-background/50 hover:bg-sidebar-background/70 text-sidebar-foreground border-sidebar-border">
                📞 {t('hotline')}
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-sidebar-background/50 hover:bg-sidebar-background/70 text-sidebar-foreground border-sidebar-border">
                💬 {t('sms_help')}
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-sidebar-background/50 hover:bg-sidebar-background/70 text-sidebar-foreground border-sidebar-border">
                🏠 {t('field_visit')}
              </Button>
              <Separator className="bg-sidebar-border" />
              <div className="p-2 bg-sidebar-background/30 rounded-lg">
                <p className="text-xs font-medium text-sidebar-foreground">{t('krishibhavan_label')}</p>
                <p className="text-xs text-sidebar-foreground/70">കൊച്ചി സെന്റർ - 2.3 കി.മീ</p>
                <p className="text-xs text-sidebar-foreground/70">0484-2345678</p>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Collapsible open={showHelpCard} onOpenChange={setShowHelpCard}>
            <Card className="bg-sidebar-accent border-sidebar-border">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-2 cursor-pointer">
                  <CardTitle className="text-sm font-medium text-sidebar-foreground flex items-center justify-between">
                    <div className="flex items-center">
                      <IdCard className="w-4 h-4 mr-2" />
                      {t('help_tips_title')}
                    </div>
                    <PanelLeftClose className={`w-4 h-4 transition-transform ${showHelpCard ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2 text-xs text-sidebar-foreground/80">
                    <p>{t('help_tip1')}</p>
                    <p>{t('help_tip2')}</p>
                    <p>{t('help_tip3')}</p>
                    <p>{t('help_tip4')}</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Footer */}
          <div className="space-y-2">
            <div className="text-xs text-sidebar-foreground/60 text-center">
              {t('last_synced')} {lastSynced}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border">
              <SkipBack className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}