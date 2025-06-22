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
├── go.mod                    # Go module dependencies
├── go.sum                    # Go dependency checksums
└── README.md                 # This documentation
```

### Algorithm

The optimiser uses a **Beam Search algorithm** to efficiently explore the vast search space of possible timetable combinations:

1. **State Space**: Each state represents a partial timetable assignment
2. **Beam Width**: Maintains top N (=100) most promising states at each step (=2500) (configurable)
3. **Branching Factor**: Limits the number of options considered per lesson type (=100) (configurable)
4. **Scoring Function**: Evaluates states based on:
   - Total walking distance between consecutive classes
   - Lunch break timing
   - <= 2 hours max gap between classes (configurable)

## API Reference

### POST `/api/optimiser/optimise`

#### Request Body

```json
{
  "modules": ["CS1010S", "CS2030S", "MA1521"],
  "recordings": ["CS1010S Lecture", "CS2030S Laboratory"],
  "freeDays": ["Monday", "Friday"],
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
    [ /* Monday slots */ ],
    [ /* Tuesday slots */ ],
    [ /* Wednesday slots */ ],  
    [ /* Thursday slots */ ],
    [ /* Friday slots */ ]
  ],
  "DayDistance": [
    0, // Monday
    0, // Tuesday
    0.6879499381097249, // Wednesday
    34.33700778293036, // Thursday
    7.738363670499865 // Friday
  ],
  "TotalDistance": 42.76332139153995,
  "shareableLink": "https://nusmods.com/timetable/sem-1/share?CS1010S=LEC:1,REC:04&CS2030S=LEC:1&MA1521=LEC:1,TUT:01"
}
```

#### Parameters

| Field          | Type       | Description                                                                            |
| -------------- | ---------- | -------------------------------------------------------------------------------------- |
| `modules`      | `[]string` | Module codes to include in optimisation in Upper case (e.g. "CS1010S")                 |
| `recordings`   | `[]string` | Lessons marked as recorded/online (format: "MODULE LessonType") e.g. "CS1010S Lecture" |
| `freeDays`     | `[]string` | Weekdays to keep free of physical classes e.g. "Monday"                                |
| `earliestTime` | `string`   | Earliest acceptable class time (HHMM format)                                           |
| `latestTime`   | `string`   | Latest acceptable class time (HHMM format)                                             |
| `acadYear`     | `string`   | Academic year (format: "YYYY-YYYY") e.g. "2024-2025"                                   |
| `acadSem`      | `int`      | Semester number (1 or 2)                                                               |
| `lunchStart`   | `string`   | Preferred lunch break start time (HHMM)                                                |
| `lunchEnd`     | `string`   | Preferred lunch break end time (HHMM)                                                  |

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

3. **Test the API**
- Send a POST request following the request body format above to `http://localhost:8080/api/optimiser/optimise`

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

## Potential Improvements

- Once there is more concrete information on the building location for each venue, we can remove the current method of identifying building by taking the first few letters before the '-' in the venue name. This will improve the accuracy and reduce search space.
- Tweak the scoring function to prioritise more important constraints found from user feedback. For instance:
  - Previously the scoring function was just for distance but it produced less ideal timetables where students had 4-5 hour gaps between classes. This was fixed by punishing gaps that are 
  larger than 2 hours between lessons linearly. 

- Tweak the beam search parameters to improve performance (perhaps depending on the number of modules)
- Create a more accurate heuristic for scoring distance between consecutive classes. (Currently, it just a random linear function that seems to work)
- Add more constraints to optimisation proceess
- Clean up codebase to make it more maintainable