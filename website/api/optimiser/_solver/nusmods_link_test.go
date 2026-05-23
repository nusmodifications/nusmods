package solver

import (
	"strings"
	"testing"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// ──────────────────────────────────────────────────
// serializeLessonIndices
// ──────────────────────────────────────────────────

func TestSerializeLessonIndices(t *testing.T) {
	tests := []struct {
		name  string
		input []models.LessonIndex
		want  string
	}{
		{"empty slice", nil, ""},
		{"empty non-nil slice", []models.LessonIndex{}, ""},
		{"single zero", []models.LessonIndex{0}, "0"},
		{"single non-zero", []models.LessonIndex{5}, "5"},
		{"multiple in order", []models.LessonIndex{1, 2, 3}, "1,2,3"},
		{"multiple out of order preserved", []models.LessonIndex{3, 1, 2}, "3,1,2"},
		{"large indices", []models.LessonIndex{100, 200, 300}, "100,200,300"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := serializeLessonIndices(tt.input)
			if got != tt.want {
				t.Errorf("serializeLessonIndices(%v) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// createConfig
// ──────────────────────────────────────────────────

func TestCreateConfig(t *testing.T) {
	t.Run("single assignment maps to lesson indices", func(t *testing.T) {
		assignments := map[string]string{"CS1010S|Lecture": "01"}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS1010S|Lecture": {
				{
					{ClassNo: "01", LessonIndex: 0},
					{ClassNo: "01", LessonIndex: 2},
				},
				{
					{ClassNo: "02", LessonIndex: 1},
				},
			},
		}

		config := createConfig(assignments, lessonToSlots)

		if config["CS1010S"] == nil {
			t.Fatal("expected CS1010S in config")
		}
		indices := config["CS1010S"]["Lecture"]
		if len(indices) != 2 {
			t.Fatalf("expected 2 lesson indices, got %d: %v", len(indices), indices)
		}
		if indices[0] != 0 || indices[1] != 2 {
			t.Errorf("expected indices [0 2], got %v", indices)
		}
	})

	t.Run("assignment with classNo not in lessonToSlots groups produces no indices", func(t *testing.T) {
		assignments := map[string]string{"CS1010S|Lecture": "99"}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS1010S|Lecture": {
				{{ClassNo: "01", LessonIndex: 0}},
			},
		}
		config := createConfig(assignments, lessonToSlots)
		// classNo "99" is never found -> no indices appended
		if indices := config["CS1010S"]["Lecture"]; len(indices) != 0 {
			t.Errorf("expected empty indices for missing classNo, got %v", indices)
		}
	})

	t.Run("malformed lesson key without pipe is skipped", func(t *testing.T) {
		assignments := map[string]string{"NOPIPE": "01"}
		lessonToSlots := map[string][][]models.ModuleSlot{}
		config := createConfig(assignments, lessonToSlots)
		if len(config) != 0 {
			t.Errorf("expected empty config for malformed key, got %v", config)
		}
	})

	t.Run("multiple module assignments", func(t *testing.T) {
		assignments := map[string]string{
			"CS1010S|Lecture": "01",
			"MA1521|Tutorial": "T01",
		}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS1010S|Lecture": {{{ClassNo: "01", LessonIndex: 5}}},
			"MA1521|Tutorial": {{{ClassNo: "T01", LessonIndex: 3}}},
		}
		config := createConfig(assignments, lessonToSlots)

		if len(config) != 2 {
			t.Errorf("expected 2 modules in config, got %d", len(config))
		}
		if config["CS1010S"]["Lecture"][0] != 5 {
			t.Errorf("CS1010S Lecture index = %d, want 5", config["CS1010S"]["Lecture"][0])
		}
		if config["MA1521"]["Tutorial"][0] != 3 {
			t.Errorf("MA1521 Tutorial index = %d, want 3", config["MA1521"]["Tutorial"][0])
		}
	})

	t.Run("same module multiple lesson types", func(t *testing.T) {
		assignments := map[string]string{
			"CS2040S|Lecture":  "1",
			"CS2040S|Tutorial": "T1",
		}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS2040S|Lecture":  {{{ClassNo: "1", LessonIndex: 0}}},
			"CS2040S|Tutorial": {{{ClassNo: "T1", LessonIndex: 10}}},
		}
		config := createConfig(assignments, lessonToSlots)
		if config["CS2040S"] == nil {
			t.Fatal("expected CS2040S in config")
		}
		if len(config["CS2040S"]) != 2 {
			t.Errorf("expected 2 lesson types for CS2040S, got %d", len(config["CS2040S"]))
		}
	})
}

// ──────────────────────────────────────────────────
// serializeConfig
// ──────────────────────────────────────────────────

func TestSerializeConfig(t *testing.T) {
	t.Run("empty config returns empty string", func(t *testing.T) {
		got := serializeConfig(map[string]map[string][]models.LessonIndex{})
		if got != "" {
			t.Errorf("expected empty string, got %q", got)
		}
	})

	t.Run("single module single lecture", func(t *testing.T) {
		config := map[string]map[string][]models.LessonIndex{
			"CS1010S": {"Lecture": {0, 2}},
		}
		got := serializeConfig(config)
		// LessonTypeAbbrev["LECTURE"] = "LEC"
		if !strings.Contains(got, "CS1010S") {
			t.Errorf("serialized config %q missing module code CS1010S", got)
		}
		if !strings.Contains(got, "LEC:") {
			t.Errorf("serialized config %q missing lesson type abbreviation LEC", got)
		}
		if !strings.Contains(got, "(0,2)") {
			t.Errorf("serialized config %q missing lesson indices (0,2)", got)
		}
	})

	t.Run("single module multiple lesson types joined with separator", func(t *testing.T) {
		config := map[string]map[string][]models.LessonIndex{
			"CS1010S": {
				"Lecture":  {0},
				"Tutorial": {5},
			},
		}
		got := serializeConfig(config)
		// Both LEC and TUT should appear, joined by ModuleCodeSeparator ";"
		if !strings.Contains(got, "LEC:(0)") || !strings.Contains(got, "TUT:(5)") {
			t.Errorf("expected both LEC:(0) and TUT:(5) in serialized output: %q", got)
		}
		if !strings.Contains(got, constants.ModuleCodeSeparator) {
			t.Errorf("expected ModuleCodeSeparator %q in multi-lesson output: %q",
				constants.ModuleCodeSeparator, got)
		}
	})

	t.Run("multiple modules joined with ampersand", func(t *testing.T) {
		config := map[string]map[string][]models.LessonIndex{
			"CS1010S": {"Lecture": {0}},
			"MA1521":  {"Lecture": {3}},
		}
		got := serializeConfig(config)
		if !strings.Contains(got, "&") {
			t.Errorf("expected & between modules in %q", got)
		}
	})

	t.Run("unknown lesson type abbreviation is empty string not panic", func(t *testing.T) {
		config := map[string]map[string][]models.LessonIndex{
			"CS1010S": {"UNKNOWN_TYPE": {0}},
		}
		// Should not panic; abbrev will be empty string
		got := serializeConfig(config)
		if !strings.Contains(got, "CS1010S") {
			t.Logf("got: %q", got)
		}
		// Just verify it doesn't panic and returns a string
		_ = got
	})
}

// ──────────────────────────────────────────────────
// FillDefaultsAndGenerateShareableLinks
// ──────────────────────────────────────────────────

func TestFillDefaultsAndGenerateShareableLinks_SemesterPaths(t *testing.T) {
	semTests := []struct {
		acadSem     int
		wantPathSeg string
	}{
		{1, "/sem-1/share"},
		{2, "/sem-2/share"},
		{3, "/st-i/share"},
		{4, "/st-ii/share"},
		{99, "/sem-1/share"}, // default case
	}

	for _, tt := range semTests {
		t.Run("sem_path", func(t *testing.T) {
			assignments := map[string]string{"CS1010S|Lecture": "01"}
			lessonToSlots := map[string][][]models.ModuleSlot{
				"CS1010S|Lecture": {
					{{ClassNo: "01", LessonIndex: 0}},
				},
			}
			defaultSlots := map[string]map[string][]models.ModuleSlot{}
			req := models.OptimiserRequest{AcadSem: tt.acadSem}

			link, _ := FillDefaultsAndGenerateShareableLinks(assignments, defaultSlots, lessonToSlots, req)

			if !strings.Contains(link, tt.wantPathSeg) {
				t.Errorf("AcadSem=%d: URL %q does not contain %q", tt.acadSem, link, tt.wantPathSeg)
			}
			if !strings.HasPrefix(link, constants.NUSModsTimetableBaseURL) {
				t.Errorf("URL %q should start with %q", link, constants.NUSModsTimetableBaseURL)
			}
		})
	}
}

func TestFillDefaultsAndGenerateShareableLinks_DefaultFilling(t *testing.T) {
	t.Run("unassigned lesson gets default class from defaultSlots", func(t *testing.T) {
		assignments := map[string]string{} // nothing assigned
		defaultSlots := map[string]map[string][]models.ModuleSlot{
			"cs1010s": {
				"Tutorial": {
					{ClassNo: "T01", LessonIndex: 7},
				},
			},
		}
		lessonToSlots := map[string][][]models.ModuleSlot{}
		req := models.OptimiserRequest{AcadSem: 1}

		_, defaultLink := FillDefaultsAndGenerateShareableLinks(assignments, defaultSlots, lessonToSlots, req)

		// After the call, assignments["CS1010S|Tutorial"] should be "T01"
		if assignments["CS1010S|Tutorial"] != "T01" {
			t.Errorf("expected default assignment CS1010S|Tutorial=T01, got %q", assignments["CS1010S|Tutorial"])
		}
		// defaultLink should contain the module code
		if !strings.Contains(defaultLink, "CS1010S") {
			t.Errorf("defaultLink %q does not contain CS1010S", defaultLink)
		}
	})

	t.Run("already-assigned lesson is not overwritten by default", func(t *testing.T) {
		assignments := map[string]string{"CS1010S|Lecture": "02"}
		defaultSlots := map[string]map[string][]models.ModuleSlot{
			"cs1010s": {
				"Lecture": {
					{ClassNo: "01", LessonIndex: 0},
				},
			},
		}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS1010S|Lecture": {
				{{ClassNo: "02", LessonIndex: 1}},
				{{ClassNo: "01", LessonIndex: 0}},
			},
		}
		req := models.OptimiserRequest{AcadSem: 1}

		FillDefaultsAndGenerateShareableLinks(assignments, defaultSlots, lessonToSlots, req)

		if assignments["CS1010S|Lecture"] != "02" {
			t.Errorf("expected assignment preserved as 02, got %q", assignments["CS1010S|Lecture"])
		}
	})

	t.Run("two links returned for same academic semester", func(t *testing.T) {
		assignments := map[string]string{"CS1010S|Lecture": "01"}
		lessonToSlots := map[string][][]models.ModuleSlot{
			"CS1010S|Lecture": {{{ClassNo: "01", LessonIndex: 0}}},
		}
		defaultSlots := map[string]map[string][]models.ModuleSlot{}
		req := models.OptimiserRequest{AcadSem: 2}

		link, defaultLink := FillDefaultsAndGenerateShareableLinks(assignments, defaultSlots, lessonToSlots, req)

		if !strings.Contains(link, "/sem-2/share") {
			t.Errorf("link %q missing /sem-2/share", link)
		}
		if !strings.Contains(defaultLink, "/sem-2/share") {
			t.Errorf("defaultLink %q missing /sem-2/share", defaultLink)
		}
	})
}
