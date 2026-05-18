# NUSMods Timetable Optimiser

An intelligent timetable optimisation service that explores millions of possible timetable combinations to generate optimal schedules for NUS students. Built with Go and deployed as a serverless function on Vercel.

## Features

The optimiser intelligently prioritises:

- **Preferred free days** - Keep entire days free from physical classes
- **Ideal class timings** - Respect earliest and latest class time preferences
- **Lunch flexibility** - Optimise for preferred lunch break timing ranges
- **Minimal travel distance** - Reduce walking distances between consecutive classes using venue coordinates
- **Recording/Non-physical preferences** - Handle online/recorded lessons that don't require physical attendance

## Architecture

### Core Components

```
website/api/optimiser/
├── optimise.go               # Main HTTP handler and entry point for vercel serverless function
├── _constants/               # Constants
├── _client/                  # HTTP client
├── _models/                  # Data structures and types
├── _modules/                 # Module data processing for optimisation
├── _solver/
│   ├── solver.go             # Main solver logic
│   └── nusmods_link.go       # Shareable NUSMods link generation
├── _test/
│   ├── api_test.go           # Integration tests
│   └── server/main.go        # Test server for local development
├── go.mod                    # Go module dependencies
├── go.sum                    # Go dependency checksums
└── README.md                 # This documentation
```

> **Why the `_` prefix?** Vercel treats any directory without a leading `_` as a potential serverless function entry point. Prefixing internal packages with `_` tells Vercel to ignore them and only deploy `optimise.go` as the function handler.

### End-to-End Data Flow

A single request moves through the following stages:

1. **`optimise.go` — HTTP handler**: Decodes the JSON request body into `OptimiserRequest` and calls `solver.Solve`.

2. **`_modules/GetAllModuleSlots`**: For each requested module, fetches timetable data from the NUSMods API (`_client`). Slots are then filtered (removing those outside the time window or on free days) and deduplicated — two class numbers that share the same day, start time, and building are treated as equivalent and merged to reduce the search space. Returns a map of `Module → LessonType → ClassNo → []Slot`.

3. **`_solver/beamSearch`**: Lessons are first sorted by number of available options (fewest first — the **Minimum Remaining Values** heuristic). The beam search then assigns one lesson type at a time, expanding each partial timetable into up to `BranchingFactor` candidates, scoring them all, and keeping only the top `BeamWidth`. This repeats until all lessons are assigned.

4. **`_solver/FillDefaultsAndGenerateShareableLinks`**: Converts the final assignment map into 2 shareable URLs (one without default slots and one with default slots). (see [Response fields](#response) below).

5. **Response**: The best timetable state plus both share links is JSON-encoded and returned.

### Algorithm

The optimiser uses a **Beam Search algorithm** to efficiently explore the vast search space of possible timetable combinations:

1. **State Space**: Each state represents a partial timetable assignment
2. **Beam Width**: Maintains the top 5000 most promising states at each step (configurable via `BeamWidth` constant)
3. **Branching Factor**: Limits the number of options considered per lesson type to 100 (configurable via `BranchingFactor` constant)
4. **MRV Heuristic**: Lessons with fewer class options are assigned first, pruning infeasible branches early
5. **Scoring Function**: Evaluates states based on:
   - Total walking distance between consecutive classes using haversine formula
   - Having a one-hour break within provided lunch time window
   - <= Maximum hours of consecutive live lessons
   - <= 2 hours max gap between classes (configurable)

### Hard vs Soft Constraints

Understanding this distinction is essential before modifying the solver.

**Hard constraints** are enforced during slot filtering in `_modules/mergeAndFilterModuleSlots` — slots that violate them are removed from the search space entirely and will never appear in any result:

- `freeDays` — non-recorded lessons on a free day are filtered out
- `earliestTime` / `latestTime` — slots outside this window are filtered out

**Soft constraints** are penalties applied by the scoring function in `_solver/scoreTimetableState`. They influence which timetable is chosen but do not guarantee the result satisfies them (if no feasible option avoids the penalty, the least-bad option is returned):

- Lunch break availability
- Consecutive hours of study
- Gaps between classes
- Walking distance between venues

### Scoring Constants

All constants live in `_constants/constants.go`. Lower scores are better — the beam search returns the state with the lowest score.

#### Beam Search Parameters

| Constant          | Value | Rationale                                                                                                                                                                          |
| ----------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BeamWidth`       | 5000  | Number of partial timetables retained at each step. Higher = better quality but slower. 5000 was empirically chosen as a good quality/speed tradeoff for typical 7–8 module loads. |
| `BranchingFactor` | 100   | Maximum class options explored per lesson type per beam step. Most modules have well under 100 sections, so this acts as a safety cap rather than an active constraint.            |

#### Scoring Weights

The scoring function combines four penalty/bonus terms. All values were empirically tuned — the relative magnitudes matter more than the absolute values.

| Constant                      | Value    | Meaning                                                                                                                                                                                         |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LunchBonus`                  | −300     | Applied when a ≥60 min gap exists within the lunch window. Negative because lower score = better.                                                                                               |
| `NoLunchPenalty`              | +300     | Applied when no viable lunch break exists. Combined swing of 600 points makes lunch the **highest-priority** objective.                                                                         |
| `LunchRequiredTime`           | 60 min   | Minimum gap (in minutes) that qualifies as a lunch break.                                                                                                                                       |
| `GapPenaltyThreshold`         | 120 min  | Gaps up to 2 hours are acceptable downtime. Beyond this, students are effectively waiting on campus.                                                                                            |
| `GapPenaltyRate`              | 100/hr   | Linear penalty per hour exceeding the gap threshold. A 3-hour gap costs 100 points; a 4-hour gap costs 200.                                                                                     |
| `ConsecutiveHoursPenaltyRate` | 100/hr   | Linear penalty per hour exceeding `maxConsecutiveHours`. Each back-to-back hour over the limit costs 100 points.                                                                                |
| `MaxWalkDistance`             | 0.250 km | Reference distance for the walking penalty formula: `(10.0 / MaxWalkDistance) × km`. A 250 m walk scores exactly 10 points. Distances beyond this scale linearly — e.g. a 500 m walk scores 20. |
| `NoVenuePenalty`              | 100      | Applied when either venue has no known coordinates. Equivalent to a ~2.5 km walk, deliberately high to deprioritise unknown venues over known-nearby ones.                                      |

**Priority order** (highest → lowest):

1. Lunch break (±300 per day with classes)
2. Consecutive hours (100 per excess hour)
3. Large gaps (100 per excess hour beyond 2 h)
4. Walking distance (~10 per 250 m transition)

## API Reference

### POST `/api/optimiser/optimise`

#### Request Body

```json
{
  "modules": ["CS1010S", "CS2030S", "MA1521"],
  "recordings": ["CS1010S|Lecture", "CS2030S|Laboratory"],
  "freeDays": ["Monday", "Friday"],
  "maxConsecutiveHours": 4,
  "earliestTime": "0900",
  "latestTime": "1800",
  "acadYear": "2024-2025",
  "acadSem": 1,
  "lunchStart": "1200",
  "lunchEnd": "1400"
}
```

#### Response

```json
{
  "Assignments": {
    "CS1010S|Lecture": "1",
    "CS1010S|Recitation": "04",
    "CS2030S|Lecture": "1",
    "MA1521|Lecture": "1",
    "MA1521|Tutorial": "01"
  },
  "DaySlots": [
    [
      // Monday slots
      {
        "classNo": "05",
        "day": "Monday",
        "endTime": "1600",
        "lessonType": "Laboratory",
        "startTime": "1400",
        "venue": "COM1-B108",
        "coordinates": {
          "x": 103.773994,
          "y": 1.2948803
        },
        "weeks": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        "StartMin": 840,
        "EndMin": 960,
        "DayIndex": 0,
        "LessonKey": "CS2040S|Laboratory",
        "WeeksSet": {
          "10": {},
          "11": {},
          "12": {},
          "13": {},
          "3": {},
          "4": {},
          "5": {},
          "6": {},
          "7": {},
          "8": {},
          "9": {}
        },
        "WeeksString": "3,4,5,6,7,8,9,10,11,12,13"
      }
    ],
    [
      // Tuesday slots
    ],
    [
      // Wednesday slots
    ],
    [
      // Thursday slots
    ],
    [
      // Friday slots
    ],
    [
      // Saturday slots
    ]
  ],
  "DayDistance": [
    0, // Monday
    0, // Tuesday
    0.6879499381097249, // Wednesday
    34.33700778293036, // Thursday
    7.738363670499865, // Friday
    0 // Saturday
  ],
  "TotalDistance": 42.76332139153995,
  "Score": 150.5,
  "shareableLink": "https://nusmods.com/timetable/sem-1/share?CS1010S=LEC:(1),REC:(04)&CS2030S=LEC:(1)&MA1521=LEC:(1),TUT:(01)",
  "defaultShareableLink": "https://nusmods.com/timetable/sem-1/share?CS1010S=LEC:(1),REC:(04)&CS2030S=LEC:(1)&MA1521=LEC:(1),TUT:(01)"
}
```

#### Response Fields

| Field                  | Description                                                                                                                                                                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Assignments`          | Map of `"MODULE\|LessonType"` → chosen `classNo` for every lesson type that was successfully assigned.                                                                                                                                                                     |
| `DaySlots`             | Array of 6 days (Mon–Sat), each containing time-sorted slots for that day. Mirrors `Assignments` but structured for rendering.                                                                                                                                             |
| `DayDistance`          | Per-day walking penalty score (sum of haversine distances between consecutive physical lessons).                                                                                                                                                                           |
| `TotalDistance`        | Sum of all `DayDistance` values.                                                                                                                                                                                                                                           |
| `Score`                | Final score from the scoring function. Lower is better.                                                                                                                                                                                                                    |
| `shareableLink`        | NUSMods timetable URL containing only the lessons that were assigned (hard-constraint-satisfying slots only). Some lesson types may be absent if they were impossible to schedule given the constraints.                                                                   |
| `defaultShareableLink` | NUSMods timetable URL containing **all** lesson types for all modules. Lesson types absent from `Assignments` are filled with an arbitrary default class number. Use this to give the user a complete timetable view even when some constraints forced partial assignment. |

#### Parameters

| Field                 | Type       | Description                                                                              |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `modules`             | `[]string` | Module codes to include in optimisation in Upper case (e.g. "CS1010S")                   |
| `recordings`          | `[]string` | Lessons marked as recorded/online (format: "MODULE\|LessonType") e.g. "CS1010S\|Lecture" |
| `freeDays`            | `[]string` | Days to keep free of physical classes e.g. "Monday"                                      |
| `earliestTime`        | `string`   | Earliest acceptable class time (HHMM format)                                             |
| `latestTime`          | `string`   | Latest acceptable class time (HHMM format)                                               |
| `acadYear`            | `string`   | Academic year (format: "YYYY-YYYY") e.g. "2024-2025"                                     |
| `acadSem`             | `int`      | Semester number: 1 (Sem 1), 2 (Sem 2), 3 (Special Term I), 4 (Special Term II)           |
| `lunchStart`          | `string`   | Preferred lunch break start time (HHMM)                                                  |
| `lunchEnd`            | `string`   | Preferred lunch break end time (HHMM)                                                    |
| `maxConsecutiveHours` | `int`      | Maximum consecutive live lesson hours allowed                                            |

## Getting Started

### Prerequisites

- [Go 1.23.4](https://golang.org/dl/) or later

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/nusmodifications/nusmods.git
   cd nusmods/website/api/optimiser
   ```

2. **Install dependencies**

   ```bash
   go mod tidy
   ```

3. **Run test server**

   ```bash
   pnpm start:optimiser
   ```

4. **Run frontend**(if needed)

   ```bash
   pnpm start:local
   ```

5. **Test the API**

- Send a POST request following the request body format above to `http://localhost:8020/optimise`
- Or run the integration tests (requires the test server to be running):
  ```bash
  go test ./_test/... -v
  ```

## Linting and Formatting

- Lint the code using:
  ```bash
  golangci-lint run
  ```
  _Auto fix issues where possible:_
  ```bash
  golangci-lint run --fix
  ```
- Format the code using:
  ```bash
  golangci-lint fmt
  ```
- The golangci-lint configuration is defined in `.golangci.yaml`

## Dependencies

| Package                                                                  | Purpose                                                          |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`github.com/umahmood/haversine`](https://github.com/umahmood/haversine) | Calculate walking distances between venues using GPS coordinates |

## Performance

- **Typical Runtime**: 5-40 seconds depending on complexity
- **Search Space**: Handles millions of possible timetable combinations
- **Memory Efficient**: Uses beam search to limit memory usage while maintaining solution quality

## Limitations

- **Venue Data Dependency**: Optimisation quality depends on accurate venue coordinate data from NUSMods
- **Academic Year Coverage**: Limited to semesters with available NUSMods API data
- **Lesson Type Support**: Optimises for standard NUS lesson types (may not handle special/custom lesson formats)
- **Soft constraint results**: Lunch, consecutive hours, and gap preferences are not guaranteed — the solver returns the best available option even if it violates them

## Venue Data

Venue coordinates are stored in `_constants/venues.json` and embedded into the binary at compile time via `//go:embed`. The file maps venue codes (e.g. `"COM1-B108"`) to GPS coordinates.

Venues without an entry in `venues.json` receive `InvalidCoordinates` and are penalised with `NoVenuePenalty` during scoring

The slot merging step in `_modules/mergeAndFilterModuleSlots` uses the building prefix (the part of the venue code before the first `-`) to deduplicate class options. For example, `COM1-B108` and `COM1-0210` are treated as the same building. If a new venue uses a non-standard naming convention, verify the deduplication still behaves correctly.

## Potential Improvements

- Once there is more concrete information on the building location for each venue, we can remove the current method of identifying building by taking the first few letters before the '-' in the venue name. This will improve the accuracy and reduce search space.
- Tweak the scoring function to prioritise more important constraints found from user feedback. For instance:
- Tweak the beam search parameters to improve performance (perhaps depending on the number of modules)
- Create a more accurate heuristic for scoring distance between consecutive classes. (Currently, it just a random linear function that seems to work)
- Add more constraints to optimisation proceess
