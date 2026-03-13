import type { RenderableLesson, RenderableTimetable } from './render-model';
import { darken, getSurfaceColors } from './theme';

const OUTER_PADDING = 16;
const DAY_LABEL_WIDTH = 56;
const HOUR_HEADER_HEIGHT = 20;
const DAY_GAP = 0;
const MODULE_TABLE_GAP = 12;
const MODULE_SECTION_GAP = 16;
const ROW_MARGIN_BOTTOM = 1;
const TIMETABLE_ROW_HEIGHT = 57.6;
const BORDER_RADIUS = 4;
const MODULE_CARD_HEIGHT = 54;
const MODULE_ROW_GAP = 10;
const FOOTER_HEIGHT = 48;
const BOTTOM_PADDING = 14;

const FONT_SIZE_S = 13.6;
const FONT_SIZE_XS = 12;
const FONT_SIZE_XXS = 10.4;
const CELL_LINE_HEIGHT = 13.6;
const CELL_PADDING = 4.8;
const CELL_BORDER_BOTTOM_WIDTH = 3.2;
const DAY_ROW_PADDING_BOTTOM = 4.8;

const VERTICAL_HEIGHT_PER_HOUR = 76.8;
const VERTICAL_DAY_LABEL_HEIGHT = 40;
const VERTICAL_TIME_LABEL_WIDTH = 60;
const VERTICAL_ROW_MARGIN_RIGHT = 1;
const VERTICAL_DAY_COL_UNIT_WIDTH = 100;

const INTER_SEMIBOLD_AVG_CHAR_WIDTH_RATIO = 0.58;

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * INTER_SEMIBOLD_AVG_CHAR_WIDTH_RATIO;
}

function estimateTitleLines(title: string, cellWidthPx: number): number {
  const availableWidth = cellWidthPx - CELL_PADDING * 2;
  if (availableWidth <= 0) return 1;
  const titleWidth = estimateTextWidth(title, FONT_SIZE_XS);
  return Math.max(1, Math.ceil(titleWidth / availableWidth));
}

function computeRowHeight(
  row: RenderableLesson[],
  gridContentWidth: number,
  startingIndex: number,
  endingIndex: number,
): number {
  const hasWeekText = row.some((lesson) => lesson.weekText);
  const baseLineCount = hasWeekText ? 4 : 3;
  const totalCols = endingIndex - startingIndex;

  let maxTitleExtraLines = 0;
  for (const lesson of row) {
    const lessonCols = Math.max(lesson.endIndex - lesson.startIndex, 1);
    const cellWidthPx = (lessonCols / totalCols) * gridContentWidth;
    const titleLines = estimateTitleLines(lesson.displayTitle, cellWidthPx);
    maxTitleExtraLines = Math.max(maxTitleExtraLines, titleLines - 1);
  }

  const lineCount = baseLineCount + maxTitleExtraLines;
  const contentHeight = lineCount * CELL_LINE_HEIGHT + CELL_PADDING * 2 + CELL_BORDER_BOTTOM_WIDTH;
  return Math.max(TIMETABLE_ROW_HEIGHT, contentHeight);
}

function ModuleColorMarker({
  color,
  isHidden,
  isTa,
  surface,
}: {
  color: string;
  isHidden: boolean;
  isTa: boolean;
  surface: ReturnType<typeof getSurfaceColors>;
}) {
  return (
    <div
      style={{
        border: `1px ${isHidden ? 'dashed' : 'solid'} ${
          isHidden || isTa ? surface.grayLight : 'transparent'
        }`,
        borderRadius: 4,
        display: 'flex',
        height: 20,
        marginRight: 8,
        marginTop: 2,
        overflow: 'hidden',
        padding: isHidden || isTa ? 1 : 0,
        width: 20,
      }}
    >
      <div
        style={{
          background: isHidden
            ? 'transparent'
            : isTa
              ? `linear-gradient(315deg, ${surface.grayLight} 50%, ${color} 50%)`
              : color,
          borderRadius: 3,
          height: 18,
          marginLeft: -1,
          marginTop: -1,
          width: 18,
        }}
      />
    </div>
  );
}

export type TimetableImageLayout = {
  cardColumns: number;
  cardWidth: number;
  height: number;
  sidebarWidth?: number;
  width: number;
};

function LessonBlock({
  lesson,
  rowHeight,
  style,
}: {
  lesson: RenderableLesson;
  rowHeight: number;
  style: React.CSSProperties;
}) {
  const borderColor = darken(lesson.color, 20);
  const textColor = darken(lesson.color, 40);

  return (
    <div
      style={{
        alignItems: 'flex-start',
        background: lesson.color,
        borderBottom: `${CELL_BORDER_BOTTOM_WIDTH}px solid ${borderColor}`,
        boxSizing: 'border-box',
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        height: rowHeight,
        justifyContent: 'flex-start',
        minWidth: 0,
        overflow: 'hidden',
        padding: CELL_PADDING,
        position: 'absolute',
        textAlign: 'left',
        top: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: FONT_SIZE_XS,
          fontWeight: 600,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
          overflowWrap: 'break-word',
          width: '100%',
        }}
      >
        {lesson.displayTitle}
      </div>
      <div
        style={{
          fontSize: FONT_SIZE_XXS,
          fontWeight: 400,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
        }}
      >
        {lesson.lessonMeta}
      </div>
      <div
        style={{
          fontSize: FONT_SIZE_XXS,
          fontWeight: 400,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
        }}
      >
        {lesson.venue}
      </div>
      {lesson.weekText && (
        <div
          style={{
            fontSize: FONT_SIZE_XXS,
            fontWeight: 400,
            lineHeight: `${CELL_LINE_HEIGHT}px`,
          }}
        >
          {lesson.weekText}
        </div>
      )}
    </div>
  );
}

function LessonRow({
  endingIndex,
  row,
  rowHeight,
  startingIndex,
  isLastRow,
}: {
  endingIndex: number;
  row: RenderableLesson[];
  rowHeight: number;
  startingIndex: number;
  isLastRow: boolean;
}) {
  const totalCols = endingIndex - startingIndex;

  return (
    <div
      style={{
        display: 'flex',
        height: rowHeight,
        marginBottom: isLastRow ? 0 : ROW_MARGIN_BOTTOM,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {row.map((lesson) => {
        const offset = ((lesson.startIndex - startingIndex) / totalCols) * 100;
        const width = (Math.max(lesson.endIndex - lesson.startIndex, 1) / totalCols) * 100;

        return (
          <LessonBlock
            key={lesson.key}
            lesson={lesson}
            rowHeight={rowHeight}
            style={{
              left: `${offset}%`,
              width: `${width}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function VerticalLessonBlock({
  lesson,
  style,
}: {
  lesson: RenderableLesson;
  style: React.CSSProperties;
}) {
  const borderColor = darken(lesson.color, 20);
  const textColor = darken(lesson.color, 40);

  return (
    <div
      style={{
        alignItems: 'flex-start',
        background: lesson.color,
        borderBottom: `${CELL_BORDER_BOTTOM_WIDTH}px solid ${borderColor}`,
        boxSizing: 'border-box',
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        minWidth: 0,
        overflow: 'hidden',
        padding: CELL_PADDING,
        position: 'absolute',
        textAlign: 'left',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: FONT_SIZE_XS,
          fontWeight: 600,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
          overflowWrap: 'break-word',
          width: '100%',
        }}
      >
        {lesson.displayTitle}
      </div>
      <div
        style={{
          fontSize: FONT_SIZE_XXS,
          fontWeight: 400,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
        }}
      >
        {lesson.lessonMeta}
      </div>
      <div
        style={{
          fontSize: FONT_SIZE_XXS,
          fontWeight: 400,
          lineHeight: `${CELL_LINE_HEIGHT}px`,
        }}
      >
        {lesson.venue}
      </div>
      {lesson.weekText && (
        <div
          style={{
            fontSize: FONT_SIZE_XXS,
            fontWeight: 400,
            lineHeight: `${CELL_LINE_HEIGHT}px`,
          }}
        >
          {lesson.weekText}
        </div>
      )}
    </div>
  );
}

function VerticalLessonRow({
  endingIndex,
  row,
  startingIndex,
  isLastRow,
  dayHeight,
}: {
  endingIndex: number;
  row: RenderableLesson[];
  startingIndex: number;
  isLastRow: boolean;
  dayHeight: number;
}) {
  const totalCols = endingIndex - startingIndex;

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: dayHeight,
        marginRight: isLastRow ? 0 : VERTICAL_ROW_MARGIN_RIGHT,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {row.map((lesson) => {
        const offset = ((lesson.startIndex - startingIndex) / totalCols) * 100;
        const height = (Math.max(lesson.endIndex - lesson.startIndex, 1) / totalCols) * 100;

        return (
          <VerticalLessonBlock
            key={lesson.key}
            lesson={lesson}
            style={{
              top: `${offset}%`,
              height: `${height}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function computeVerticalDayHeight(totalCols: number): number {
  return (VERTICAL_HEIGHT_PER_HOUR / 4) * totalCols;
}

const VERTICAL_SIDEBAR_GAP = 16;
const VERTICAL_SIDEBAR_WIDTH = 300;

export function estimateVerticalImageLayout(
  model: RenderableTimetable,
  _width: number,
  minHeight?: number,
) {
  const sidebarWidth = VERTICAL_SIDEBAR_WIDTH;
  const showActiveUnits = model.activeUnits !== model.totalUnits;

  const totalCols = model.endingIndex - model.startingIndex;
  const timetableHeight = VERTICAL_DAY_LABEL_HEIGHT + computeVerticalDayHeight(totalCols);

  const totalDayUnits = model.days.reduce((sum, day) => sum + Math.max(day.rows.length, 1), 0);
  const gridWidth =
    VERTICAL_TIME_LABEL_WIDTH +
    totalDayUnits * VERTICAL_DAY_COL_UNIT_WIDTH +
    Math.max(model.days.length - 1, 0) +
    2;

  const moduleListHeight =
    model.moduleCards.length * MODULE_CARD_HEIGHT +
    Math.max(model.moduleCards.length - 1, 0) * MODULE_ROW_GAP;
  const sidebarContentHeight =
    moduleListHeight + FOOTER_HEIGHT + (showActiveUnits ? 18 : 0) + BOTTOM_PADDING;

  const contentHeight = Math.max(timetableHeight, sidebarContentHeight);
  const totalWidth = OUTER_PADDING * 2 + gridWidth + VERTICAL_SIDEBAR_GAP + sidebarWidth;

  return {
    cardColumns: 1,
    cardWidth: sidebarWidth,
    height: Math.max(OUTER_PADDING * 2 + contentHeight, minHeight ?? 0),
    sidebarWidth,
    width: totalWidth,
  } satisfies TimetableImageLayout;
}

export function estimateImageLayout(model: RenderableTimetable, width: number, minHeight?: number) {
  const cardColumns = width >= 992 ? 3 : width >= 576 ? 2 : 1;
  const cardWidth =
    (width - OUTER_PADDING * 2 - MODULE_TABLE_GAP * (cardColumns - 1)) / cardColumns;
  const showActiveUnits = model.activeUnits !== model.totalUnits;

  const gridContentWidth = width - OUTER_PADDING * 2 - DAY_LABEL_WIDTH;
  const timetableHeight =
    HOUR_HEADER_HEIGHT +
    model.days.reduce(
      (sum, day) =>
        sum +
        day.rows.reduce(
          (rowSum, row) =>
            rowSum +
            computeRowHeight(row, gridContentWidth, model.startingIndex, model.endingIndex),
          0,
        ) +
        Math.max(day.rows.length - 1, 0) * ROW_MARGIN_BOTTOM,
      0,
    ) +
    model.days.length * DAY_ROW_PADDING_BOTTOM +
    Math.max(model.days.length - 1, 0) * DAY_GAP;

  const cardRows = Math.max(Math.ceil(Math.max(model.moduleCards.length, 1) / cardColumns), 1);
  const moduleSectionHeight =
    cardRows * MODULE_CARD_HEIGHT +
    Math.max(cardRows - 1, 0) * MODULE_ROW_GAP +
    MODULE_SECTION_GAP +
    FOOTER_HEIGHT +
    (showActiveUnits ? 18 : 0) +
    BOTTOM_PADDING;

  return {
    cardColumns,
    cardWidth,
    height: Math.max(OUTER_PADDING * 2 + timetableHeight + moduleSectionHeight, minHeight ?? 0),
    width,
  } satisfies TimetableImageLayout;
}

function HorizontalTimetableGrid({
  gridContentWidth,
  model,
  surface,
}: {
  gridContentWidth: number;
  model: RenderableTimetable;
  surface: ReturnType<typeof getSurfaceColors>;
}) {
  const hourSegmentCount = (model.endingIndex - model.startingIndex) / 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Time labels row */}
      <div
        style={{
          display: 'flex',
          fontSize: FONT_SIZE_S,
          fontWeight: 700,
          height: HOUR_HEADER_HEIGHT,
          marginLeft: DAY_LABEL_WIDTH,
          position: 'relative',
        }}
      >
        {model.timeLabels.map((time) => {
          const pct =
            ((time.index - model.startingIndex) / (model.endingIndex - model.startingIndex)) * 100;
          return (
            <div
              key={time.index}
              style={{
                display: 'flex',
                left: `${pct}%`,
                position: 'absolute',
                transform: 'translateX(-50%)',
              }}
            >
              {time.label}
            </div>
          );
        })}
      </div>

      {/* Timetable grid */}
      <div
        style={{
          border: `1px solid ${surface.border}`,
          borderLeftWidth: 0,
          borderRadius: BORDER_RADIUS,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {model.days.map((day, dayIndex) => {
          const rowHeights = day.rows.map((row) =>
            computeRowHeight(row, gridContentWidth, model.startingIndex, model.endingIndex),
          );
          const dayHeight =
            rowHeights.reduce((sum, h) => sum + h, 0) +
            Math.max(day.rows.length - 1, 0) * ROW_MARGIN_BOTTOM +
            DAY_ROW_PADDING_BOTTOM;

          return (
            <div
              key={day.day}
              style={{
                borderBottom:
                  dayIndex === model.days.length - 1 ? '0' : `1px solid ${surface.border}`,
                display: 'flex',
                minHeight: dayHeight,
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  background: surface.dayLabelBackground,
                  borderLeft: `1px solid ${surface.border}`,
                  borderRight: `1px solid ${surface.border}`,
                  display: 'flex',
                  flex: `0 0 ${DAY_LABEL_WIDTH}px`,
                  fontSize: FONT_SIZE_S,
                  fontWeight: 600,
                  justifyContent: 'center',
                  lineHeight: `${CELL_LINE_HEIGHT}px`,
                  textTransform: 'uppercase',
                }}
              >
                {day.day.slice(0, 3)}
              </div>
              <div
                style={{
                  background: `linear-gradient(to right, ${surface.grayLightest} 50%, transparent 50%)`,
                  backgroundSize: `${200 / hourSegmentCount}% 100%`,
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  minHeight: dayHeight,
                  paddingBottom: DAY_ROW_PADDING_BOTTOM,
                }}
              >
                {day.rows.map((row, index) => (
                  <LessonRow
                    key={`${day.day}-${index}`}
                    endingIndex={model.endingIndex}
                    row={row}
                    rowHeight={rowHeights[index]}
                    startingIndex={model.startingIndex}
                    isLastRow={index === day.rows.length - 1}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalTimetableGrid({
  model,
  surface,
}: {
  model: RenderableTimetable;
  surface: ReturnType<typeof getSurfaceColors>;
}) {
  const totalCols = model.endingIndex - model.startingIndex;
  const hourSegmentCount = totalCols / 4;
  const dayHeight = computeVerticalDayHeight(totalCols);

  return (
    <div style={{ display: 'flex' }}>
      {/* Time labels column */}
      <div
        style={{
          display: 'flex',
          flex: `0 0 ${VERTICAL_TIME_LABEL_WIDTH}px`,
          fontSize: FONT_SIZE_S,
          fontWeight: 700,
          height: dayHeight,
          marginTop: VERTICAL_DAY_LABEL_HEIGHT,
          paddingRight: 4,
          position: 'relative',
          textAlign: 'right',
        }}
      >
        {model.timeLabels.map((time) => {
          const pct =
            ((time.index - model.startingIndex) / (model.endingIndex - model.startingIndex)) * 100;
          return (
            <div
              key={time.index}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                position: 'absolute',
                right: 12,
                top: `${pct}%`,
                transform: 'translateY(-50%)',
                width: '100%',
              }}
            >
              {time.label}
            </div>
          );
        })}
      </div>

      {/* Timetable grid — days as fixed-width columns */}
      <div
        style={{
          border: `1px solid ${surface.border}`,
          borderRadius: BORDER_RADIUS,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {model.days.map((day, dayIndex) => {
          const colWidth = Math.max(day.rows.length, 1) * VERTICAL_DAY_COL_UNIT_WIDTH;
          return (
            <div
              key={day.day}
              style={{
                borderLeft: dayIndex === 0 ? '0' : `1px solid ${surface.border}`,
                display: 'flex',
                flex: `0 0 ${colWidth}px`,
                flexDirection: 'column',
                minHeight: VERTICAL_DAY_LABEL_HEIGHT + dayHeight,
              }}
            >
              {/* Day label — horizontal text, top of column */}
              <div
                style={{
                  alignItems: 'center',
                  background: surface.dayLabelBackground,
                  display: 'flex',
                  flex: `0 0 ${VERTICAL_DAY_LABEL_HEIGHT}px`,
                  fontSize: FONT_SIZE_S,
                  fontWeight: 600,
                  justifyContent: 'center',
                  lineHeight: `${CELL_LINE_HEIGHT}px`,
                  textTransform: 'uppercase',
                }}
              >
                {day.day.slice(0, 3)}
              </div>
              {/* Lesson rows — side by side within this day column */}
              <div
                style={{
                  background: `linear-gradient(to bottom, ${surface.grayLightest} 50%, transparent 50%)`,
                  backgroundSize: `100% ${200 / hourSegmentCount}%`,
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'row',
                  height: dayHeight,
                  paddingLeft: 1,
                }}
              >
                {day.rows.map((row, index) => (
                  <VerticalLessonRow
                    key={`${day.day}-${index}`}
                    endingIndex={model.endingIndex}
                    row={row}
                    startingIndex={model.startingIndex}
                    isLastRow={index === day.rows.length - 1}
                    dayHeight={dayHeight}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCardsList({
  layout,
  model,
  surface,
}: {
  layout: TimetableImageLayout;
  model: RenderableTimetable;
  surface: ReturnType<typeof getSurfaceColors>;
}) {
  const showActiveUnits = model.activeUnits !== model.totalUnits;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {model.moduleCards.length ? (
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            ...(model.isVertical
              ? { flexDirection: 'column' as const }
              : { flexWrap: 'wrap' as const, columnGap: MODULE_TABLE_GAP }),
            rowGap: MODULE_ROW_GAP,
          }}
        >
          {model.moduleCards.map((module) => (
            <div
              key={module.moduleCode}
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                minHeight: MODULE_CARD_HEIGHT,
                opacity: module.isHidden ? 0.6 : 1,
                width: layout.cardWidth,
              }}
            >
              <ModuleColorMarker
                color={module.color}
                isHidden={module.isHidden}
                isTa={module.isTa}
                surface={surface}
              />
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  minWidth: 0,
                  paddingTop: 1,
                }}
              >
                <div
                  style={{
                    color: module.color,
                    display: 'flex',
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.18,
                  }}
                >
                  {`${module.moduleCode} ${module.title}`}
                </div>
                <div
                  style={{
                    color: surface.gray,
                    display: 'flex',
                    fontSize: 12.25,
                    lineHeight: 1.18,
                    marginTop: 1,
                  }}
                >
                  {module.metaLine}
                  {module.isTa ? ' • TA' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            fontSize: 14.4,
            justifyContent: 'center',
            padding: '8px 0',
          }}
        >
          No courses added.
        </div>
      )}
      <div
        style={{
          color: surface.mutedText,
          display: 'flex',
          fontSize: 12.75,
          justifyContent: showActiveUnits ? 'space-between' : 'flex-start',
          marginTop: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {showActiveUnits && (
            <div style={{ display: 'flex', gap: 4 }}>
              <span>Active Units:</span>
              <span style={{ color: surface.gray, fontWeight: 700 }}>
                {model.activeUnits} Units
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            <span>Total Units:</span>
            <span style={{ color: surface.gray, fontWeight: 700 }}>{model.totalUnits} Units</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimetableImage({
  layout,
  model,
}: {
  layout: TimetableImageLayout;
  model: RenderableTimetable;
}) {
  const surface = getSurfaceColors(model.colorScheme);

  if (model.isVertical) {
    return (
      <div
        style={{
          background: surface.background,
          color: surface.text,
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'Inter',
          height: layout.height,
          padding: OUTER_PADDING,
          width: layout.width,
        }}
      >
        <VerticalTimetableGrid model={model} surface={surface} />
        <div
          style={{
            color: surface.bodyColor,
            display: 'flex',
            flex: `0 0 ${layout.sidebarWidth}px`,
            flexDirection: 'column',
            fontSize: 14,
            marginLeft: VERTICAL_SIDEBAR_GAP,
            paddingTop: 4,
          }}
        >
          <ModuleCardsList layout={layout} model={model} surface={surface} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: surface.background,
        color: surface.text,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter',
        height: layout.height,
        padding: OUTER_PADDING,
        width: layout.width,
      }}
    >
      <HorizontalTimetableGrid
        gridContentWidth={layout.width - OUTER_PADDING * 2 - DAY_LABEL_WIDTH}
        model={model}
        surface={surface}
      />

      <div
        style={{
          borderTop: `1px solid ${surface.border}`,
          color: surface.bodyColor,
          display: 'flex',
          flexDirection: 'column',
          fontSize: 14,
          marginTop: MODULE_SECTION_GAP,
          paddingBottom: BOTTOM_PADDING,
          paddingTop: 8,
        }}
      >
        <ModuleCardsList layout={layout} model={model} surface={surface} />
      </div>
    </div>
  );
}
