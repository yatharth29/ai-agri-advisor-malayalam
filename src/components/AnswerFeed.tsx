"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  MessageCircleReply, 
  MessageCircleQuestionMark, 
  MessageSquareDot,
  MessageCircleMore,
  BadgeQuestionMark,
  MessageCirclePlus,
  InspectionPanel,
  ShieldQuestionMark
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface Query {
  id: string;
  query: string;
  malayalamQuery?: string;
  timestamp: Date;
  status: "ai-replied" | "clarifying-question" | "escalated" | "resolved";
  attachments?: string[];
  detectedEntities?: {
    crop?: string;
    pest?: string;
    location?: string;
    plot?: string;
  };
  answer?: {
    content: string;
    confidence: "high" | "medium" | "low";
    steps?: string[];
    dosAndDonts?: {
      dos: string[];
      donts: string[];
    };
  };
  sources?: {
    id: string;
    title: string;
    excerpt: string;
    type: "advisory" | "weather" | "guideline";
  }[];
  feedback?: {
    helpful: boolean;
    comments?: string;
  };
}

interface EscalationData {
  queryId: string;
  recipientType: "officer" | "krishibhavan";
  priority: "low" | "medium" | "high";
  notes: string;
  attachments: string[];
  suggestedAction: string;
}

const mockQueries: Query[] = [
  {
    id: "1",
    query: "My rice plants have brown spots on leaves",
    malayalamQuery: "എന്റെ നെല്ലിന്റെ ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പാടുകൾ ഉണ്ട്",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "ai-replied",
    attachments: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300"],
    detectedEntities: {
      crop: "Rice",
      pest: "Brown Spot Disease",
      location: "Kottayam",
      plot: "Plot A-1"
    },
    answer: {
      content: "Based on the symptoms, this appears to be Brown Spot disease caused by Bipolaris oryzae fungus.",
      confidence: "high",
      steps: [
        "Remove infected leaves immediately",
        "Apply Carbendazim 50% WP @ 1g/liter",
        "Improve field drainage to reduce humidity",
        "Maintain proper plant spacing for air circulation"
      ],
      dosAndDonts: {
        dos: [
          "Apply fungicide during early morning or evening",
          "Use resistant varieties for future planting",
          "Monitor weather conditions regularly"
        ],
        donts: [
          "Don't over-water the field",
          "Don't apply nitrogen fertilizer excessively",
          "Don't ignore early symptoms"
        ]
      }
    },
    sources: [
      {
        id: "1",
        title: "Rice Disease Management Guidelines",
        excerpt: "Brown spot is one of the most common rice diseases in Kerala, especially during monsoon season.",
        type: "guideline"
      },
      {
        id: "2",
        title: "Local Weather Advisory",
        excerpt: "High humidity levels (>80%) predicted for next 3 days, favorable for fungal diseases.",
        type: "weather"
      }
    ]
  },
  {
    id: "2",
    query: "When to harvest coconut?",
    malayalamQuery: "തെങ്ങ് എപ്പോൾ പറിക്കണം?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "escalated",
    detectedEntities: {
      crop: "Coconut",
      location: "Thrissur",
      plot: "Plot B-3"
    },
    answer: {
      content: "Coconut harvesting time depends on the variety and intended use.",
      confidence: "medium",
      steps: [
        "For tender coconut: 6-7 months after flowering",
        "For mature coconut: 12 months after flowering",
        "Check the brown color of husk for maturity"
      ]
    }
  }
];

const AnswerFeed = () => {
  const [queries, setQueries] = useState<Query[]>(mockQueries);
  const [loading, setLoading] = useState(false);
  const [followUpText, setFollowUpText] = useState<{ [key: string]: string }>({});
  const [expandedSources, setExpandedSources] = useState<{ [key: string]: boolean }>({});
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [escalationForm, setEscalationForm] = useState<Partial<EscalationData>>({
    recipientType: "officer",
    priority: "medium",
    notes: "",
    attachments: [],
    suggestedAction: ""
  });
  const { t, language } = useI18n();

  const getStatusColor = (status: Query["status"]) => {
    switch (status) {
      case "ai-replied": return "bg-success text-white";
      case "clarifying-question": return "bg-warning text-white";
      case "escalated": return "bg-accent text-white";
      case "resolved": return "bg-primary text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case "high": return t("conf_high");
      case "medium": return t("conf_medium");
      case "low": return t("conf_low");
      default: return "";
    }
  };

  const handleFollowUp = (queryId: string) => {
    const text = followUpText[queryId];
    if (!text?.trim()) return;

    toast.success(t("followup_sent_toast"));
    setFollowUpText(prev => ({ ...prev, [queryId]: "" }));
  };

  const handleFeedback = (queryId: string, helpful: boolean, comments?: string) => {
    setQueries(prev => prev.map(q => 
      q.id === queryId 
        ? { ...q, feedback: { helpful, comments } }
        : q
    ));
    toast.success(helpful ? t("feedback_thanks_toast") : t("feedback_recorded_toast"));
  };

  const handleEscalate = () => {
    if (!selectedEscalation || !escalationForm.notes?.trim()) {
      toast.error(t("fill_all_details_error"));
      return;
    }

    setQueries(prev => prev.map(q => 
      q.id === selectedEscalation 
        ? { ...q, status: "escalated" as const }
        : q
    ));

    toast.success(t("escalate_success_toast"));
    setSelectedEscalation(null);
    setEscalationForm({
      recipientType: "officer",
      priority: "medium",
      notes: "",
      attachments: [],
      suggestedAction: ""
    });
  };

  const handleSaveToNotebook = (queryId: string) => {
    toast.success(t("saved_to_notebook_toast"));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-4/5"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircleMore className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{t("no_questions_title")}</h3>
        <p className="text-muted-foreground mb-6">{t("no_questions_desc")}</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{t("tips_line1")}</p>
          <p>{t("tips_line2")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {queries.map((query) => (
        <Card key={query.id} className="bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(query.status)}>
                    {query.status === "ai-replied" && t("status_ai_replied")}
                    {query.status === "clarifying-question" && t("status_clarifying")}
                    {query.status === "escalated" && t("status_escalated")}
                    {query.status === "resolved" && t("status_resolved")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {query.timestamp.toLocaleTimeString(
                      language === "ml" ? "ml-IN" : language === "hi" ? "hi-IN" : "en-IN",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium">{query.malayalamQuery || query.query}</p>
                  {query.malayalamQuery && (
                    <p className="text-sm text-muted-foreground mt-1">{query.query}</p>
                  )}
                </div>

                {query.detectedEntities && (
                  <div className="flex flex-wrap gap-2">
                    {query.detectedEntities.crop && (
                      <Badge variant="secondary">🌾 {query.detectedEntities.crop}</Badge>
                    )}
                    {query.detectedEntities.pest && (
                      <Badge variant="secondary">🐛 {query.detectedEntities.pest}</Badge>
                    )}
                    {query.detectedEntities.location && (
                      <Badge variant="secondary">📍 {query.detectedEntities.location}</Badge>
                    )}
                    {query.detectedEntities.plot && (
                      <Badge variant="secondary">🏞️ {query.detectedEntities.plot}</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {query.attachments && query.attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {query.attachments.map((attachment, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-16 h-16 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-auto rounded-md"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </CardHeader>

          {query.answer && (
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t("ai_answer")}</h4>
                  {query.answer.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {getConfidenceText(query.answer.confidence)}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed">{query.answer.content}</p>

                {query.answer.steps && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">{t("steps_title")}</h5>
                    <ul className="space-y-1">
                      {query.answer.steps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary font-medium">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {query.answer.dosAndDonts && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-success">{t("dos_title")}</h5>
                      <ul className="space-y-1">
                        {query.answer.dosAndDonts.dos.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-destructive">{t("donts_title")}</h5>
                      <ul className="space-y-1">
                        {query.answer.dosAndDonts.donts.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {query.sources && query.sources.length > 0 && (
                <Collapsible
                  open={expandedSources[query.id]}
                  onOpenChange={(open) => 
                    setExpandedSources(prev => ({ ...prev, [query.id]: open }))
                  }
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-2 w-full justify-start">
                      <InspectionPanel className="h-4 w-4 mr-2" />
                      {t("sources_evidence")} ({query.sources.length})
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {query.sources.map((source) => (
                      <div key={source.id} className="bg-background rounded-md p-3 border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" size="sm">
                            {source.type === "advisory" && t("source_advisory")}
                            {source.type === "weather" && t("source_weather")}
                            {source.type === "guideline" && t("source_guideline")}
                          </Badge>
                          <h6 className="font-medium text-sm">{source.title}</h6>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.excerpt}</p>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback(query.id, true)}
                    className={query.feedback?.helpful === true ? "bg-success/10 text-success" : ""}
                  >
                    👍
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback(query.id, false)}
                    className={query.feedback?.helpful === false ? "bg-destructive/10 text-destructive" : ""}
                  >
                    👎
                  </Button>
                </div>

                <Button size="sm" variant="ghost" className="gap-2">
                  <MessageCircleReply className="h-4 w-4" />
                  {t("follow_up")}
                </Button>

                <Button size="sm" variant="ghost" className="gap-2">
                  <MessageCircleQuestionMark className="h-4 w-4" />
                  {t("ask_clarification")}
                </Button>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-2"
                  onClick={() => handleSaveToNotebook(query.id)}
                >
                  <MessageSquareDot className="h-4 w-4" />
                  {t("save")}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-2"
                      onClick={() => {
                        setSelectedEscalation(query.id);
                        setEscalationForm(prev => ({
                          ...prev,
                          queryId: query.id,
                          suggestedAction: query.answer?.content || ""
                        }));
                      }}
                    >
                      <ShieldQuestionMark className="h-4 w-4" />
                      {t("escalate")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("escalate_title")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recipient">{t("recipient")}</Label>
                        <Select
                          value={escalationForm.recipientType}
                          onValueChange={(value: "officer" | "krishibhavan") =>
                            setEscalationForm(prev => ({ ...prev, recipientType: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="officer">{t("recipient_officer")}</SelectItem>
                            <SelectItem value="krishibhavan">{t("recipient_krishibhavan")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">{t("priority")}</Label>
                        <Select
                          value={escalationForm.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setEscalationForm(prev => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{t("low")}</SelectItem>
                            <SelectItem value="medium">{t("medium")}</SelectItem>
                            <SelectItem value="high">{t("high")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="urgent" />
                        <Label htmlFor="urgent">{t("urgent")}</Label>
                      </div>

                      <div>
                        <Label htmlFor="notes">{t("notes")}</Label>
                        <Textarea
                          id="notes"
                          placeholder={t("notes_placeholder")}
                          value={escalationForm.notes}
                          onChange={(e) =>
                            setEscalationForm(prev => ({ ...prev, notes: e.target.value }))
                          }
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedEscalation(null)}>
                          {t("cancel")}
                        </Button>
                        <Button onClick={handleEscalate} className="flex-1">
                          {t("escalate")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder={t("followup_placeholder")}
                  value={followUpText[query.id] || ""}
                  onChange={(e) =>
                    setFollowUpText(prev => ({ ...prev, [query.id]: e.target.value }))
                  }
                  className="resize-none"
                  rows={2}
                />
                {followUpText[query.id]?.trim() && (
                  <Button 
                    size="sm" 
                    onClick={() => handleFollowUp(query.id)}
                    className="gap-2"
                  >
                    <MessageCirclePlus className="h-4 w-4" />
                    {t("send")}
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AnswerFeed;