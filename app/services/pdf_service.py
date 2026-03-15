import io
import os
import math
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.piecharts import Pie

# --- ELEGANT PALETTE (SOVEREIGN BRANDING) ---
PURE_WHITE    = colors.HexColor("#FFFFFF")
BG_HIGHLIGHT  = colors.HexColor("#F9FBF9")
DEEP_GREEN    = colors.HexColor("#1B4332")
FOREST        = colors.HexColor("#2D6A4F")
SAGE          = colors.HexColor("#52B788")
MINT_LIGHT    = colors.HexColor("#B7E4C7")
GOLD_ACCENT   = colors.HexColor("#D4AF37")
WARM_GRAY     = colors.HexColor("#6B7280")
LIGHT_GRAY    = colors.HexColor("#E5E7EB")
INK           = colors.HexColor("#111827")
PALE_MINT     = colors.HexColor("#E8F5E9")

PSYCH_QUOTES = [
    "Your emotions are not obstacles to clarity.\nThey are the path to it.",
    "You cannot heal what you refuse to feel.\nBut you have already begun.",
    "Every time you name what you feel,\nyou reclaim a piece of yourself.",
    "The days you almost didn't open the app\nare the days it mattered most.",
]

# --- PREMIUM COVER DESIGN ---
def draw_premium_cover(canvas, doc):
    W, H = A4
    canvas.saveState()
    canvas.setFillColor(PURE_WHITE); canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(BG_HIGHLIGHT); canvas.rect(0, 0, W, H, fill=1, stroke=0)

    margin = 12*mm
    canvas.setStrokeColor(SAGE); canvas.setStrokeAlpha(0.35); canvas.setLineWidth(0.6)
    canvas.rect(margin, margin, W - 2*margin, H - 2*margin, fill=0, stroke=1)
    inner_m = 14.5*mm
    canvas.setStrokeAlpha(0.15); canvas.setLineWidth(0.3)
    canvas.rect(inner_m, inner_m, W - 2*inner_m, H - 2*inner_m, fill=0, stroke=1)

    def bracket(cx, cy, fx=1, fy=1):
        canvas.saveState(); canvas.translate(cx, cy)
        canvas.setStrokeColor(DEEP_GREEN); canvas.setStrokeAlpha(0.6); canvas.setLineWidth(1.5)
        canvas.line(0, 0, fx * 14*mm, 0); canvas.line(0, 0, 0, fy * 14*mm)
        canvas.setFillColor(SAGE); canvas.circle(0, 0, 2.2, fill=1, stroke=0)
        canvas.restoreState()

    bracket(margin, margin, 1, 1); bracket(W-margin, margin, -1, 1)
    bracket(margin, H-margin, 1, -1); bracket(W-margin, H-margin, -1, -1)

    canvas.setFillColor(SAGE); canvas.setFont("Helvetica", 7.5); label = "E M O T I O N A L   I N T E L L I G E N C E   P L A T F O R M"
    canvas.drawCentredString(W/2, H - 28*mm, label)
    canvas.setStrokeColor(SAGE); canvas.setStrokeAlpha(0.3); canvas.setLineWidth(0.5)
    canvas.line(W/2 - 40*mm, H - 31*mm, W/2 + 40*mm, H - 31*mm)

    logo_size = 85*mm; logo_y = H/2 - logo_size/2 + 15*mm
    canvas.setFillColor(PALE_MINT); canvas.setFillAlpha(0.55); canvas.circle(W/2, logo_y + logo_size/2, logo_size/2 + 8*mm, fill=1, stroke=0)
    canvas.setFillAlpha(0.25); canvas.circle(W/2, logo_y + logo_size/2, logo_size/2 + 15*mm, fill=1, stroke=0); canvas.setFillAlpha(1.0)
    
    logo_path = os.path.join(os.getcwd(), "logo.png")
    if os.path.exists(logo_path):
        canvas.drawImage(logo_path, W/2-logo_size/2, logo_y, width=logo_size, height=logo_size, mask='auto', preserveAspectRatio=True)

    tag_y = H/2 - logo_size/2
    canvas.setFillColor(FOREST); canvas.setFont("Helvetica", 11); canvas.drawCentredString(W/2, tag_y, "Track \u00b7 Reflect \u00b7 Grow")

    quote_y = tag_y - 25*mm
    canvas.setFillColor(MINT_LIGHT); canvas.setFont("Helvetica-Bold", 48); canvas.drawString(W/2 - 60*mm, quote_y + 2*mm, "\u201C")
    canvas.setFillColor(INK); canvas.setFont("Helvetica-Oblique", 11)
    canvas.drawCentredString(W/2, quote_y - 4*mm, "Your emotions are data, not chaos.")
    canvas.drawCentredString(W/2, quote_y - 10*mm, "Understand yourself, one day at a time.")
    canvas.setFillColor(MINT_LIGHT); canvas.setFont("Helvetica-Bold", 48); canvas.drawString(W/2 + 50*mm, quote_y - 15*mm, "\u201D")

    bot_y = margin + 16*mm
    canvas.setStrokeColor(LIGHT_GRAY); canvas.setLineWidth(0.5); canvas.line(margin + 10*mm, bot_y + 5*mm, W - margin - 10*mm, bot_y + 5*mm)
    canvas.setFillColor(WARM_GRAY); canvas.setFont("Helvetica", 7.5); canvas.drawString(margin + 12*mm, bot_y, "Version 2.5.0")
    canvas.drawCentredString(W/2, bot_y, datetime.now().strftime("%B %Y"))
    canvas.drawRightString(W - margin - 12*mm, bot_y, "Sovereign Growth Registry"); canvas.restoreState()

def draw_inner_footer(canvas, doc):
    W, H = A4
    canvas.saveState()
    # Watermark
    canvas.setFillColor(PALE_MINT); canvas.setFillAlpha(0.08); canvas.setFont("Helvetica-Bold", 70)
    canvas.translate(W/2, H/2); canvas.rotate(35)
    tw = canvas.stringWidth("EMOLIT","Helvetica-Bold",70)
    canvas.drawString(-tw/2, 0, "EMOLIT")
    canvas.restoreState()
    # Footer
    canvas.saveState()
    canvas.setStrokeColor(PALE_MINT); canvas.setLineWidth(0.5); canvas.line(15*mm, 14*mm, W-15*mm, 14*mm)
    canvas.setFillColor(SAGE); canvas.circle(15*mm, 14*mm, 1.8, fill=1, stroke=0); canvas.circle(W-15*mm, 14*mm, 1.8, fill=1, stroke=0)
    canvas.setFillColor(WARM_GRAY); canvas.setFont("Helvetica", 7.5)
    canvas.drawString(18*mm, 9*mm, "EMOLIT  \u00b7  Emotional Intelligence Platform")
    canvas.drawCentredString(W/2, 9*mm, datetime.now().strftime("%B %Y"))
    canvas.drawRightString(W-18*mm, 9*mm, f"Page {doc.page}")
    canvas.restoreState()

# --- COMPONENTS ---
def sec_header(label, title):
    return [
        Paragraph(f'<font size="7.5" color="#52B788"><b>{label}</b></font>', ParagraphStyle("lbl", fontName="Helvetica-Bold", spaceAfter=1)),
        Paragraph(f'<font size="22" color="#1B4332"><b>{title}</b></font>', ParagraphStyle("ttl", fontName="Helvetica-Bold", leading=28, spaceAfter=2)),
        HRFlowable(width="100%", thickness=0.8, color=MINT_LIGHT, spaceBefore=1*mm, spaceAfter=6*mm),
    ]

def quote_card(text):
    content = text.replace("\n", "<br/>")
    t = Table([[
        Paragraph('<font size="36" color="#52B788"><b>\u201C</b></font>', ParagraphStyle("ql", fontName="Helvetica-Bold", leading=40)),
        Paragraph(f'<font size="11" color="#F9FBF9"><i>{content}</i></font>', ParagraphStyle("qc", alignment=TA_CENTER, leading=18, fontName="Helvetica-Oblique")),
        Paragraph('<font size="36" color="#52B788"><b>\u201D</b></font>', ParagraphStyle("qr", fontName="Helvetica-Bold", leading=40, alignment=TA_RIGHT)),
    ]], colWidths=[1.2*cm, 13.4*cm, 1.2*cm])
    t.setStyle(TableStyle([("BACKGROUND", (0,0),(-1,-1), DEEP_GREEN), ("TOPPADDING", (0,0),(-1,-1), 12), ("BOTTOMPADDING", (0,0),(-1,-1), 12), ("LINEABOVE", (0,0),(-1,0), 1.5, GOLD_ACCENT), ("LINEBELOW", (0,-1),(-1,-1), 1.5, GOLD_ACCENT)]))
    return t

def stat_card_row(items):
    cells = []
    for val, label, sub, col_hex in items:
        cells.append(Table([
            [Paragraph(f'<font size="30" color="{col_hex}"><b>{val}</b></font>', ParagraphStyle("sv", alignment=TA_CENTER, leading=36))],
            [Paragraph(f'<font size="7.5" color="#111827"><b>{label}</b></font>', ParagraphStyle("sl", alignment=TA_CENTER, spaceAfter=2))],
            [Paragraph(f'<font size="7" color="#6B7280">{sub}</font>', ParagraphStyle("ss", alignment=TA_CENTER))],
        ], colWidths=[4.0*cm], style=[("BACKGROUND", (0,0),(-1,-1), PURE_WHITE), ("LINEABOVE", (0,0),(-1,0), 3, colors.HexColor(col_hex)), ("BOX", (0,0),(-1,-1), 0.5, LIGHT_GRAY)]))
    return Table([cells], colWidths=[4.1*cm]*len(cells), style=[("VALIGN", (0,0),(-1,-1), "TOP")])

def generate_monthly_report(user_email, entries):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1.8*cm, leftMargin=1.8*cm, topMargin=1.8*cm, bottomMargin=2.2*cm)
    
    # PREMIUM STYLES
    h_label = ParagraphStyle('HLabel', fontSize=10, textColor=SAGE, tracking=3, fontName='Helvetica-Bold', textTransform='uppercase')
    h_section = ParagraphStyle('HSection', fontSize=26, textColor=DEEP_GREEN, fontName='Helvetica-Bold', spaceBefore=20, spaceAfter=20)
    p_body = ParagraphStyle('PBody', fontSize=12, textColor=INK, leading=18)
    stat_lab = ParagraphStyle('StatLab', fontSize=8, textColor=WARM_GRAY, fontName='Helvetica-Bold', alignment=TA_CENTER, tracking=1)
    h_label_left = ParagraphStyle('HLabelLeft', parent=h_label, alignment=TA_LEFT)
    p_body_muted = ParagraphStyle('PBodyMuted', parent=p_body, textColor=WARM_GRAY)
    
    # DATA ENGINE
    now = datetime.utcnow()
    thirty_ago = now - timedelta(days=30)
    journals = [e for e in entries if e.get("entry_type") == "journal_entry"]
    words    = [e for e in entries if e.get("entry_type") == "learned_word"]
    
    activity = {i: False for i in range(30)}
    mood_scores = []
    for e in entries:
        cat = e.get("created_at")
        if cat:
            diff = (now - cat).days
            if 0 <= diff < 30: activity[29 - diff] = True
        if e.get("entry_type") == "journal_entry" and e.get("mood_score"):
            mood_scores.append(float(e["mood_score"]))
            
    active_days = sum(1 for v in activity.values() if v)
    discipline = int((active_days/30)*100)
    
    # Calculate Streaks
    max_streak = 0
    curr_streak = 0
    for i in range(30):
        if activity.get(i):
            curr_streak += 1
            max_streak = max(max_streak, curr_streak)
        else:
            curr_streak = 0
            
    # Tail-end streak
    tail_streak = 0
    for i in range(29, -1, -1):
        if activity.get(i): tail_streak += 1
        else: break

    emotion_map = {}
    for j in journals:
        for emo in j.get("ai_response", {}).get("detected_emotions", []):
            name = emo.get("word", "")
            emotion_map[name] = emotion_map.get(name, 0) + 1

    story = [PageBreak()] # Trigger Cover

    # PAGE 2: DASHBOARD
    story += sec_header("YOUR MONTHLY OVERVIEW", "Executive Dashboard")
    story.append(Paragraph("Self-awareness is the foundation of emotional sovereignty. This audit serves as a roadmap to your most conscious and resilient self.", p_body))
    story.append(Spacer(1, 0.5*cm))
    story.append(stat_card_row([
        (str(active_days), "ACTIVE DAYS", "out of 30", "#1B4332"),
        (str(len(journals)), "JOURNALS", "entries logged", "#2D6A4F"),
        (f"{max_streak}d", "HIGHEST STREAK", "monthly peak", "#D4AF37"),
        (f"{tail_streak}d", "CURRENT STREAK", "active momentum", "#52B788")
    ]))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(f'<font size="9" color="#1B4332"><b>RECENT INSIGHT:</b></font> <font size="9" color="#6B7280">{journals[-1].get("ai_response", {}).get("pattern_insight", "Steady growth recorded.") if journals else "Continuing your documentation legacy."}</font>', ParagraphStyle("desc")))
    story.append(Spacer(1, 3*cm))
    story.append(quote_card(PSYCH_QUOTES[0]))
    story.append(PageBreak())

    # PAGE 3: ANALYTICS
    story += sec_header("EMOTIONAL ANALYTICS", "Spectrum Distribution")
    story.append(Paragraph("By mapping your emotional landscape, you strip confusion of its power. When we name exactly what we feel, we move from being overwhelmed by our state to being in command of it.", p_body))
    story.append(Spacer(1, 0.5*cm))
    if emotion_map:
        d = Drawing(430, 210)
        pc = Pie(); pc.x = 110; pc.y = 15; pc.width = 190; pc.height = 190
        items = sorted(emotion_map.items(), key=lambda x: x[1], reverse=True)[:7]
        pc.data = [v for _,v in items]; pc.labels = [k for k,_ in items]
        pc.sideLabels = True; pc.slices.strokeColor = PURE_WHITE; pc.slices.strokeWidth = 2
        
        # Diversified Professional Palette
        pal = [
            colors.HexColor("#1B4332"), # Deep Green
            colors.HexColor("#4338CA"), # Indigo
            colors.HexColor("#B45309"), # Amber
            colors.HexColor("#BE123C"), # Rose
            colors.HexColor("#0F766E"), # Teal
            colors.HexColor("#6D28D9"), # Purple
            colors.HexColor("#334155")  # Slate
        ]
        for i in range(len(items)): pc.slices[i].fillColor = pal[i % len(pal)]
        d.add(pc); story.append(d)
    else:
        story.append(Paragraph("Insufficient documentation for spectrum mapping.", p_body_muted))
    story.append(Spacer(1, 1*cm)); story.append(quote_card(PSYCH_QUOTES[1])); story.append(PageBreak())

    # PAGE 4: GRID
    story += sec_header("CONSISTENCY TRACKER", "30-Day Activity Matrix")
    story.append(Paragraph("Green means you showed up. Every tile is proof that you chose yourself that day. Fill the whole grid — it is one of the most powerful things you can do for your mind.", p_body))
    story.append(Spacer(1, 0.5*cm))
    grid_rows = []
    curr = []
    for i in range(30):
        day_num = (thirty_ago + timedelta(days=i)).strftime("%d")
        active = activity.get(i, False)
        txt = PURE_WHITE if active else colors.HexColor("#94A3B8")
        curr.append(Paragraph(f'<b>{day_num}</b>', ParagraphStyle("gc", alignment=TA_CENTER, textColor=txt)))
        if (i+1) % 6 == 0: grid_rows.append(curr); curr = []
    gt = Table(grid_rows, colWidths=[2.73*cm]*6, rowHeights=[1.4*cm]*5)
    g_pref = [("GRID", (0,0),(-1,-1), 3, PURE_WHITE), ("VALIGN", (0,0),(-1,-1), "MIDDLE")]
    for r in range(5):
        for c in range(6):
            idx = r*6+c
            bg = SAGE if activity.get(idx, False) else colors.HexColor("#F1F5F9")
            g_pref.append(("BACKGROUND", (c,r), (c,r), bg))
    gt.setStyle(TableStyle(g_pref)); story.append(gt)
    story.append(Spacer(1, 2.5*cm)); story.append(quote_card(PSYCH_QUOTES[2])); story.append(PageBreak())

    # PAGE 5: VOCABULARY
    story += sec_header("LINGUISTIC GROWTH", "Vocabulary Audit")
    story.append(Paragraph("A refined emotional vocabulary acts as a sophisticated toolset for the mind. Every new concept internalized here provides a clearer lens through which to navigate your inner world.", p_body))
    story.append(Spacer(1, 0.5*cm))
    if words:
        pairs = []
        p = []
        for w in words[:10]:
            wd = w.get("word_details", {})
            card = Table([[Paragraph(f'<b>{wd.get("word")}</b>', ParagraphStyle("wt", fontSize=13, textColor=DEEP_GREEN))],
                          [Paragraph(f'<b>{wd.get("core", "emotion").upper()}</b>', ParagraphStyle("wc", fontSize=7.5, textColor=SAGE))],
                          [Paragraph(wd.get("metadata", {}).get("definition", ""), ParagraphStyle("wd", fontSize=8.5, textColor=WARM_GRAY))]], 
                         colWidths=[7.6*cm], style=[("BACKGROUND", (0,0),(-1,-1), BG_HIGHLIGHT), ("LINEABOVE", (0,0),(-1,0), 3, SAGE), ("BOX", (0,0),(-1,-1), 0.5, LIGHT_GRAY)])
            p.append(card)
            if len(p) == 2: pairs.append(p); p = []
        if p: p.append(""); pairs.append(p)
        story.append(Table(pairs, colWidths=[8.1*cm, 8.1*cm], style=[("VALIGN", (0,0),(-1,-1), "TOP")]))
    else:
        story.append(Paragraph("Expand your lexicon in the library to unlock these growth insights.", p_body_muted))
    story.append(PageBreak())

    # PAGE 6: CLOSING
    story.append(Spacer(1, 3*cm))
    story += sec_header("A NOTE FOR YOU", "You Did This.")
    story.append(Paragraph("Most people go through life never pausing to ask: <i>What am I actually feeling?</i> You chose differently. You opened the app. You logged. You reflected. That takes a courage most people never find.", p_body))
    story.append(Spacer(1, 2*cm))
    story.append(Table([[Paragraph('<b>"The privilege of a lifetime is to become who you truly are."</b>', ParagraphStyle("fq", alignment=TA_CENTER, leading=24, textColor=BG_HIGHLIGHT, fontName="Helvetica-BoldOblique"))]], 
                       colWidths=[16.4*cm], style=[("BACKGROUND", (0,0),(-1,-1), DEEP_GREEN), ("TOPPADDING", (0,0),(-1,-1), 22), ("BOTTOMPADDING", (0,0),(-1,-1), 22), ("LINEABOVE", (0,0),(-1,0), 2.5, GOLD_ACCENT), ("LINEBELOW", (0,-1),(-1,-1), 2.5, GOLD_ACCENT)]))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("See you next month. Keep going. <br/> — The Emolit Team", ParagraphStyle("sig", alignment=TA_CENTER, textColor=WARM_GRAY)))

    doc.build(story, onFirstPage=draw_premium_cover, onLaterPages=draw_inner_footer)
    buffer.seek(0)
    return buffer
