#!/usr/bin/env bash
set -euo pipefail

OLD_BASE="https://export.nusmods.com/api/export"
# NEW_BASE="http://localhost:3000/api/export"
NEW_BASE="https://nusmods-export.vercel.app/api/export"

DELAY=1 # 1 second between requests

# 10 different realistic payloads
PAYLOADS=(
  # 1: Typical CS student, semester 1, light mode, eighties theme
  '{"semester":1,"timetable":{"CS1010":{"Lecture":[0],"Tutorial":[3]},"MA1521":{"Lecture":[1],"Tutorial":[5]},"GER1000":{"Seminar":[2]},"CS1231S":{"Lecture":[0],"Tutorial":[7]},"IS1108":{"Lecture":[0],"Tutorial":[1]}},"colors":{"CS1010":0,"MA1521":1,"GER1000":2,"CS1231S":3,"IS1108":4},"hidden":[],"ta":[],"theme":{"id":"eighties","timetableOrientation":"HORIZONTAL","showTitle":false},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 2: Engineering student, semester 2, dark mode, monokai theme
  '{"semester":2,"timetable":{"EG1311":{"Laboratory":[19],"Lecture":[3]},"CS2040":{"Lecture":[1],"Tutorial":[4]},"MA1101R":{"Lecture":[0],"Tutorial":[2]}},"colors":{"EG1311":6,"CS2040":5,"MA1101R":3},"hidden":[],"ta":["EG1311"],"theme":{"id":"monokai","timetableOrientation":"HORIZONTAL","showTitle":true},"settings":{"colorScheme":"DARK_COLOR_SCHEME"}}'

  # 3: Business student, semester 1, ocean theme, vertical
  '{"semester":1,"timetable":{"ACC1006":{"Lecture":[0],"Tutorial":[2]},"ACC2002":{"Lecture":[1],"Tutorial":[3]},"BFS1001":{"Lecture":[0]}},"colors":{"ACC1006":0,"ACC2002":1,"BFS1001":7},"hidden":[],"ta":[],"theme":{"id":"ocean","timetableOrientation":"VERTICAL","showTitle":false},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 4: Heavy CS load, semester 2, google theme
  '{"semester":2,"timetable":{"CS3230":{"Tutorial":[11],"Lecture":[7]},"CS3235":{"Lecture":[0],"Tutorial":[1]},"CS2108":{"Lecture":[2],"Tutorial":[5]},"CS2100":{"Lecture":[0],"Tutorial":[8],"Laboratory":[3]},"DSA1101":{"Tutorial":[3],"Lecture":[8]}},"colors":{"CS3230":4,"CS3235":0,"CS2108":2,"CS2100":6,"DSA1101":5},"hidden":[],"ta":[],"theme":{"id":"google","timetableOrientation":"HORIZONTAL","showTitle":false},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 5: Single module, semester 1, chalk theme
  '{"semester":1,"timetable":{"CS3216":{"Lecture":[0]}},"colors":{"CS3216":3},"hidden":[],"ta":[],"theme":{"id":"chalk","timetableOrientation":"HORIZONTAL","showTitle":true},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 6: Mixed faculties, semester 2, tomorrow theme, dark mode
  '{"semester":2,"timetable":{"HSI1000":{"Workshop":[72,87],"Lecture":[27]},"PC1222":{"Lecture":[0],"Tutorial":[2]},"GES1021":{"Lecture":[1]}},"colors":{"HSI1000":7,"PC1222":1,"GES1021":4},"hidden":["GES1021"],"ta":[],"theme":{"id":"tomorrow","timetableOrientation":"HORIZONTAL","showTitle":false},"settings":{"colorScheme":"DARK_COLOR_SCHEME"}}'

  # 7: CS internship + light load, semester 3 (special term), paraiso theme
  '{"semester":3,"timetable":{"CP3880":{"Lecture":[0]},"CS4243":{"Lecture":[1],"Tutorial":[0]}},"colors":{"CP3880":2,"CS4243":5},"hidden":[],"ta":[],"theme":{"id":"paraiso","timetableOrientation":"HORIZONTAL","showTitle":false},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 8: Full example with TA + hidden, semester 2, ashes theme
  '{"semester":2,"timetable":{"CS1010S":{"Lecture":[0],"Tutorial":[1],"Recitation":[2]},"MA1521":{"Lecture":[0],"Tutorial":[3]},"CS2040":{"Lecture":[1],"Tutorial":[6]}},"colors":{"CS1010S":0,"MA1521":4,"CS2040":7},"hidden":["MA1521"],"ta":["CS1010S"],"theme":{"id":"ashes","timetableOrientation":"VERTICAL","showTitle":true},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 9: Semester 1, railscasts theme, show title
  '{"semester":1,"timetable":{"CS1010A":{"Lecture":[0],"Tutorial":[2]},"CS1231S":{"Lecture":[0],"Tutorial":[4]},"MA1101R":{"Lecture":[0],"Tutorial":[1]},"GER1000":{"Seminar":[0]}},"colors":{"CS1010A":0,"CS1231S":1,"MA1101R":6,"GER1000":3},"hidden":[],"ta":[],"theme":{"id":"railscasts","timetableOrientation":"HORIZONTAL","showTitle":true},"settings":{"colorScheme":"LIGHT_COLOR_SCHEME"}}'

  # 10: Semester 2, twilight theme, dark mode, 2 modules only
  '{"semester":2,"timetable":{"AC5010":{"Lecture":[0]},"CS3216":{"Lecture":[0]}},"colors":{"AC5010":1,"CS3216":5},"hidden":[],"ta":[],"theme":{"id":"twilight","timetableOrientation":"HORIZONTAL","showTitle":false},"settings":{"colorScheme":"DARK_COLOR_SCHEME"}}'
)

ENDPOINTS=("pdf" "image")

OUTDIR="test-output"
rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

declare -a RESULTS=()

run_test() {
  local test_num=$1
  local base_label=$2
  local base_url=$3
  local endpoint=$4
  local payload=$5
  local extra_qs=""

  if [[ "$endpoint" == "image" ]]; then
    extra_qs="&pixelRatio=2"
  fi

  local encoded
  encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$payload")
  local url="${base_url}/${endpoint}?data=${encoded}${extra_qs}"

  local start_ms
  start_ms=$(python3 -c "import time; print(int(time.time()*1000))")

  local label_lower
  label_lower=$(echo "$base_label" | tr '[:upper:]' '[:lower:]')
  local ext="png"
  if [[ "$endpoint" == "pdf" ]]; then ext="pdf"; fi
  local outfile="${OUTDIR}/${test_num}-${label_lower}-${endpoint}.${ext}"

  local http_code content_type size_bytes

  http_code=$(curl -s -o "$outfile" -w "%{http_code}" --max-time 30 "$url" 2>/dev/null) || http_code="TIMEOUT"
  
  local end_ms
  end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
  local elapsed_ms=$(( end_ms - start_ms ))

  if [[ "$http_code" == "TIMEOUT" ]]; then
    size_bytes=0
    content_type="N/A"
    rm -f "$outfile"
  else
    size_bytes=$(wc -c < "$outfile" | tr -d ' ')
    content_type=$(file -b --mime-type "$outfile" 2>/dev/null || echo "unknown")
    if [[ "$http_code" != "200" ]]; then
      mv "$outfile" "${outfile}.error.txt" 2>/dev/null || true
    fi
  fi

  local status_icon
  if [[ "$http_code" == "200" ]]; then
    status_icon="${GREEN}PASS${RESET}"
  elif [[ "$http_code" == "TIMEOUT" ]]; then
    status_icon="${RED}TOUT${RESET}"
  else
    status_icon="${RED}FAIL${RESET}"
  fi

  local size_display
  if (( size_bytes > 1048576 )); then
    size_display="$(echo "scale=1; $size_bytes / 1048576" | bc)MB"
  elif (( size_bytes > 1024 )); then
    size_display="$(echo "scale=1; $size_bytes / 1024" | bc)KB"
  else
    size_display="${size_bytes}B"
  fi

  printf "  %-4s │ %-4s │ %-5s │ %5s │ %8s │ %-24s │ %s\n" \
    "$test_num" "$base_label" "$endpoint" "${http_code}" "${elapsed_ms}ms" "$content_type" "$size_display"

  RESULTS+=("${test_num}|${base_label}|${endpoint}|${http_code}|${elapsed_ms}|${content_type}|${size_bytes}")
}

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  NUSMods Export API Load Test${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════════════════${RESET}"
echo -e "  ${DIM}OLD: ${OLD_BASE}${RESET}"
echo -e "  ${DIM}NEW: ${NEW_BASE}${RESET}"
echo -e "  ${DIM}10 payloads × 2 endpoints × 2 hosts = 40 requests, ${DELAY}s apart${RESET}"
echo -e "  ${DIM}Output: ${OUTDIR}/  (e.g. 1-old.pdf, 1-new.png)${RESET}"
echo ""

echo -e "${BOLD}  #    │ Host │ Type  │  HTTP │  Latency │ Content-Type             │ Size${RESET}"
echo "  ─────┼──────┼───────┼───────┼──────────┼──────────────────────────┼─────────"

test_counter=0

for endpoint in "${ENDPOINTS[@]}"; do
  ep_upper=$(echo "$endpoint" | tr '[:lower:]' '[:upper:]')
  echo -e "  ${CYAN}--- ${ep_upper} tests ---${RESET}"
  for i in "${!PAYLOADS[@]}"; do
    idx=$((i + 1))

    # Old host
    test_counter=$((test_counter + 1))
    run_test "$idx" "OLD" "$OLD_BASE" "$endpoint" "${PAYLOADS[$i]}"
    sleep "$DELAY"

    # New host
    test_counter=$((test_counter + 1))
    run_test "$idx" "NEW" "$NEW_BASE" "$endpoint" "${PAYLOADS[$i]}"
    
    if (( i < ${#PAYLOADS[@]} - 1 )) || [[ "$endpoint" == "pdf" ]]; then
      sleep "$DELAY"
    fi
  done
done

echo "  ─────┴──────┴───────┴───────┴──────────┴──────────────────────────┴─────────"
echo ""

# Summary
old_pass=0; old_fail=0; old_total_ms=0; old_count=0
new_pass=0; new_fail=0; new_total_ms=0; new_count=0
old_pdf_ms=0; old_pdf_n=0; new_pdf_ms=0; new_pdf_n=0
old_img_ms=0; old_img_n=0; new_img_ms=0; new_img_n=0
old_min=999999; old_max=0; new_min=999999; new_max=0
old_pdf_min=999999; old_pdf_max=0; new_pdf_min=999999; new_pdf_max=0
old_img_min=999999; old_img_max=0; new_img_min=999999; new_img_max=0

for r in "${RESULTS[@]}"; do
  IFS='|' read -r _num host ep code ms _ct _sz <<< "$r"
  if [[ "$host" == "OLD" ]]; then
    old_count=$((old_count + 1))
    old_total_ms=$((old_total_ms + ms))
    (( ms < old_min )) && old_min=$ms
    (( ms > old_max )) && old_max=$ms
    if [[ "$code" == "200" ]]; then old_pass=$((old_pass + 1)); else old_fail=$((old_fail + 1)); fi
    if [[ "$ep" == "pdf" ]]; then
      old_pdf_ms=$((old_pdf_ms + ms)); old_pdf_n=$((old_pdf_n + 1))
      (( ms < old_pdf_min )) && old_pdf_min=$ms
      (( ms > old_pdf_max )) && old_pdf_max=$ms
    fi
    if [[ "$ep" == "image" ]]; then
      old_img_ms=$((old_img_ms + ms)); old_img_n=$((old_img_n + 1))
      (( ms < old_img_min )) && old_img_min=$ms
      (( ms > old_img_max )) && old_img_max=$ms
    fi
  else
    new_count=$((new_count + 1))
    new_total_ms=$((new_total_ms + ms))
    (( ms < new_min )) && new_min=$ms
    (( ms > new_max )) && new_max=$ms
    if [[ "$code" == "200" ]]; then new_pass=$((new_pass + 1)); else new_fail=$((new_fail + 1)); fi
    if [[ "$ep" == "pdf" ]]; then
      new_pdf_ms=$((new_pdf_ms + ms)); new_pdf_n=$((new_pdf_n + 1))
      (( ms < new_pdf_min )) && new_pdf_min=$ms
      (( ms > new_pdf_max )) && new_pdf_max=$ms
    fi
    if [[ "$ep" == "image" ]]; then
      new_img_ms=$((new_img_ms + ms)); new_img_n=$((new_img_n + 1))
      (( ms < new_img_min )) && new_img_min=$ms
      (( ms > new_img_max )) && new_img_max=$ms
    fi
  fi
done

old_avg=$( (( old_count > 0 )) && echo $((old_total_ms / old_count)) || echo 0 )
new_avg=$( (( new_count > 0 )) && echo $((new_total_ms / new_count)) || echo 0 )
old_pdf_avg=$( (( old_pdf_n > 0 )) && echo $((old_pdf_ms / old_pdf_n)) || echo 0 )
new_pdf_avg=$( (( new_pdf_n > 0 )) && echo $((new_pdf_ms / new_pdf_n)) || echo 0 )
old_img_avg=$( (( old_img_n > 0 )) && echo $((old_img_ms / old_img_n)) || echo 0 )
new_img_avg=$( (( new_img_n > 0 )) && echo $((new_img_ms / new_img_n)) || echo 0 )

# Guard min values in case no results
(( old_min == 999999 )) && old_min=0
(( new_min == 999999 )) && new_min=0
(( old_pdf_min == 999999 )) && old_pdf_min=0
(( new_pdf_min == 999999 )) && new_pdf_min=0
(( old_img_min == 999999 )) && old_img_min=0
(( new_img_min == 999999 )) && new_img_min=0

W=30  # label width
C=14  # column width

echo -e "${BOLD}══════════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  SUMMARY${RESET}"
echo -e "${BOLD}══════════════════════════════════════════════════════════════════${RESET}"
echo ""
printf "  %-${W}s │ ${YELLOW}%-${C}s${RESET} │ ${CYAN}%-${C}s${RESET}\n" "" "OLD HOST" "NEW HOST"
printf "  %${W}s─┼─%${C}s─┼─%${C}s\n" "" "" "" | tr ' ' '─'
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Pass / Total"    "${old_pass} / ${old_count}" "${new_pass} / ${new_count}"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Fail count"      "${old_fail}"                "${new_fail}"
printf "  %${W}s─┼─%${C}s─┼─%${C}s\n" "" "" "" | tr ' ' '─'
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Avg latency (all)"   "${old_avg}ms"     "${new_avg}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Min latency (all)"   "${old_min}ms"     "${new_min}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Max latency (all)"   "${old_max}ms"     "${new_max}ms"
printf "  %${W}s─┼─%${C}s─┼─%${C}s\n" "" "" "" | tr ' ' '─'
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Avg latency (PDF)"   "${old_pdf_avg}ms" "${new_pdf_avg}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Min latency (PDF)"   "${old_pdf_min}ms" "${new_pdf_min}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Max latency (PDF)"   "${old_pdf_max}ms" "${new_pdf_max}ms"
printf "  %${W}s─┼─%${C}s─┼─%${C}s\n" "" "" "" | tr ' ' '─'
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Avg latency (Image)" "${old_img_avg}ms" "${new_img_avg}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Min latency (Image)" "${old_img_min}ms" "${new_img_min}ms"
printf "  %-${W}s │ %-${C}s │ %-${C}s\n" "Max latency (Image)" "${old_img_max}ms" "${new_img_max}ms"
printf "  %${W}s─┴─%${C}s─┴─%${C}s\n" "" "" "" | tr ' ' '─'

if (( new_avg > 0 && old_avg > 0 )); then
  if (( new_avg < old_avg )); then
    pct=$(( (old_avg - new_avg) * 100 / old_avg ))
    echo -e "\n  ${GREEN}New host is ~${pct}% faster overall${RESET}"
  elif (( new_avg > old_avg )); then
    pct=$(( (new_avg - old_avg) * 100 / old_avg ))
    echo -e "\n  ${RED}New host is ~${pct}% slower overall${RESET}"
  else
    echo -e "\n  ${YELLOW}Both hosts have similar latency${RESET}"
  fi
fi

CSVFILE="${OUTDIR}/results.csv"
{
  echo "test_num,host,endpoint,http_status,latency_ms,content_type,size_bytes,saved_file"
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r num host ep code ms ct sz <<< "$r"
    local_lower=$(echo "$host" | tr '[:upper:]' '[:lower:]')
    fext="png"; [[ "$ep" == "pdf" ]] && fext="pdf"
    fname="${num}-${local_lower}.${fext}"
    if [[ "$code" != "200" ]]; then
      if [[ "$code" == "TIMEOUT" ]]; then fname=""; else fname="${fname}.error.txt"; fi
    fi
    echo "${num},${host},${ep},${code},${ms},${ct},${sz},${fname}"
  done
} > "$CSVFILE"

echo ""
echo -e "${DIM}  Done. ${test_counter} requests completed.${RESET}"
echo -e "${DIM}  Files saved to: $(pwd)/${OUTDIR}/${RESET}"
echo -e "${DIM}  CSV results:    $(pwd)/${CSVFILE}${RESET}"
echo ""
ls -lh "$OUTDIR"/ 2>/dev/null || true
echo ""
