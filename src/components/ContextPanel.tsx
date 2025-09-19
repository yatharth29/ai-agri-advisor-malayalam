"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CloudSun, CloudRain, Sun, CalendarPlus2, Component, PanelTopOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    icon: string;
    rainProbability: number;
  };
  forecast: Array<{
    day: string;
    temperature: { min: number; max: number };
    condition: string;
    icon: string;
  }>;
  advisory: string;
}

interface PestAlert {
  id: string;
  title: string;
  affectedCrops: string[];
  severity: "low" | "medium" | "high";
  action: string;
  expandedDetails?: string;
  sourceLink?: string;
}

interface CropActivity {
  id: string;
  activity: string;
  crop: string;
  window: string;
  progress: number;
  urgent: boolean;
}

interface Scheme {
  id: string;
  title: string;
  deadline: string;
  applicableFor: string[];
  type: "subsidy" | "loan" | "insurance";
}

interface ExtensionOffice {
  name: string;
  hours: string;
  nextSlot: string;
  available: boolean;
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition.toLowerCase()) {
    case "sunny":
      return <Sun className="h-6 w-6 text-amber-500" />;
    case "cloudy":
      return <CloudSun className="h-6 w-6 text-slate-500" />;
    case "rainy":
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    default:
      return <CloudSun className="h-6 w-6 text-slate-500" />;
  }
};

export default function ContextPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pestAlerts, setPestAlerts] = useState<PestAlert[]>([]);
  const [cropActivities, setCropActivities] = useState<CropActivity[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [extensionOffice, setExtensionOffice] = useState<ExtensionOffice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const handleResize = () => {
      setCompactMode(window.innerWidth < 768);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock weather data
        const weatherData: WeatherData = {
          current: {
            temperature: 28,
            condition: "Cloudy",
            icon: "cloudy",
            rainProbability: 75
          },
          forecast: [
            { day: "Today", temperature: { min: 22, max: 28 }, condition: "Cloudy", icon: "cloudy" },
            { day: "Tomorrow", temperature: { min: 20, max: 26 }, condition: "Rainy", icon: "rainy" },
            { day: "Day 3", temperature: { min: 24, max: 30 }, condition: "Sunny", icon: "sunny" }
          ],
          advisory: "Rain expected — avoid spraying for 24 hrs"
        };

        // Mock pest alerts
        const alertsData: PestAlert[] = [
          {
            id: "1",
            title: "Brown Plant Hopper Alert",
            affectedCrops: ["Rice", "Paddy"],
            severity: "high",
            action: "Apply recommended insecticide immediately",
            expandedDetails: "Brown plant hoppers are causing significant damage to rice crops in the region. Monitor plants closely and apply neem-based insecticide or consult nearest extension office.",
            sourceLink: "https://agri.kerala.gov.in"
          },
          {
            id: "2",
            title: "Leaf Blight in Coconut",
            affectedCrops: ["Coconut"],
            severity: "medium",
            action: "Remove affected leaves and spray Bordeaux mixture",
            expandedDetails: "Early stage leaf blight detected. Remove and burn affected leaves immediately to prevent spread."
          }
        ];

        // Mock crop activities
        const activitiesData: CropActivity[] = [
          {
            id: "1",
            activity: "Pre-monsoon planting",
            crop: "Rice",
            window: "May 15 - June 30",
            progress: 60,
            urgent: true
          },
          {
            id: "2",
            activity: "Fertilizer application",
            crop: "Coconut",
            window: "June 1 - June 15",
            progress: 20,
            urgent: false
          }
        ];

        // Mock schemes
        const schemesData: Scheme[] = [
          {
            id: "1",
            title: "Pradhan Mantri Fasal Bima Yojana",
            deadline: "June 30, 2024",
            applicableFor: ["Rice", "Coconut", "Pepper"],
            type: "insurance"
          },
          {
            id: "2",
            title: "Kerala Organic Farming Subsidy",
            deadline: "July 15, 2024",
            applicableFor: ["All crops"],
            type: "subsidy"
          }
        ];

        // Mock extension office
        const officeData: ExtensionOffice = {
          name: "Thrissur Extension Office",
          hours: "9:00 AM - 5:00 PM",
          nextSlot: "Tomorrow 2:00 PM",
          available: true
        };

        setWeather(weatherData);
        setPestAlerts(alertsData);
        setCropActivities(activitiesData);
        setSchemes(schemesData);
        setExtensionOffice(officeData);
        setIsOffline(false);
      } catch (error) {
        console.error("Failed to fetch context data:", error);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOffline(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-white";
      case "low": return "bg-chart-2 text-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSchemeTypeColor = (type: string) => {
    switch (type) {
      case "subsidy": return "bg-success text-white";
      case "loan": return "bg-primary text-primary-foreground";
      case "insurance": return "bg-chart-1 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("context_panel_title")}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-8 w-8 p-0"
        >
          <Component className="h-4 w-4" />
        </Button>
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <Alert>
          <AlertDescription>
            {t("offline_banner")}
          </AlertDescription>
        </Alert>
      )}

      {/* Weather Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <WeatherIcon condition={weather?.current.condition || "cloudy"} />
            {t("local_weather")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weather ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{weather.current.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{t("rain_label")}: {weather.current.rainProbability}%</p>
                </div>
              </div>

              {weather.advisory && (
                <Alert>
                  <AlertDescription className="text-sm">
                    {weather.advisory}
                  </AlertDescription>
                </Alert>
              )}

              {!compactMode && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="text-center p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">{day.day}</p>
                      <WeatherIcon condition={day.condition} />
                      <p className="text-xs">{day.temperature.min}-{day.temperature.max}°C</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("weather_unavailable")}</p>
          )}
        </CardContent>
      </Card>

      {/* Pest Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("pest_alerts_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pestAlerts.length > 0 ? (
            pestAlerts.map((alert) => (
              <div key={alert.id} className="space-y-2">
                <div
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alert.affectedCrops.join(", ")}
                        </span>
                      </div>
                    </div>
                    <PanelTopOpen className={`h-4 w-4 transition-transform ${expandedAlert === alert.id ? "rotate-180" : ""}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{alert.action}</p>
                </div>

                {expandedAlert === alert.id && alert.expandedDetails && (
                  <div className="pl-3 pb-2 border-l-2 border-muted">
                    <p className="text-sm text-muted-foreground mb-2">{alert.expandedDetails}</p>
                    {alert.sourceLink && (
                      <Button variant="outline" size="sm" className="text-xs">
                        {t("view_source")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("no_active_alerts")}</p>
          )}
        </CardContent>
      </Card>

      {/* Crop Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarPlus2 className="h-4 w-4" />
            {t("crop_calendar")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cropActivities.length > 0 ? (
            cropActivities.map((activity) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{activity.activity}</h4>
                    <p className="text-xs text-muted-foreground">{activity.crop} • {activity.window}</p>
                  </div>
                  {activity.urgent && (
                    <Badge variant="destructive" className="text-xs">{t("urgent_badge")}</Badge>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${activity.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{activity.progress}% {t("season_progress_suffix")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("no_scheduled_activities")}</p>
          )}
        </CardContent>
      </Card>

      {/* Schemes & Subsidies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("schemes_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {schemes.length > 0 ? (
            schemes.map((scheme) => (
              <div key={scheme.id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm flex-1">{scheme.title}</h4>
                  <Badge className={`text-xs ${getSchemeTypeColor(scheme.type)}`}>
                    {scheme.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("deadline_label")} {scheme.deadline}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("for_label")} {scheme.applicableFor.join(", ")}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs flex-1">
                    {t("more_info")}
                  </Button>
                  <Button size="sm" className="text-xs flex-1">
                    {t("apply")}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("no_applicable_schemes")}</p>
          )}
        </CardContent>
      </Card>

      {/* Extension Office */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("extension_office")}</CardTitle>
        </CardHeader>
        <CardContent>
          {extensionOffice ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">{extensionOffice.name}</h4>
                <p className="text-xs text-muted-foreground">{t("hours_label")} {extensionOffice.hours}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium">{t("next_available")}</p>
                <p className="text-sm text-muted-foreground">{extensionOffice.nextSlot}</p>
              </div>
              
              <Button 
                size="sm" 
                className="w-full"
                disabled={!extensionOffice.available}
              >
                {t("schedule_visit")}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("office_info_unavailable")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}