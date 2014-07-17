## This file loads the current module.json and parses all the module prereq values.
## It also creates the "ModmavenTree" and the "LockedModules" fields for each module, to be used by ModMaven.

import json
import argparse
import re
import modmaven_parser

mod_exceptions = {
    'PH2216 / GEK2031': 'GEK2031'
}
useful_keys = ["Prerequisite", "Preclusion"]
freshmenSeminars = [
    "FMA1201B",
    "FMD1203",
    "FMD1202",
    "FMD1201",
    "FMD1204",
    "FMA1202S",
    "FMA1202M",
    "FMA1202N",
    "FMA1202H",
    "FMA1202F",
    "FMS1211C",
    "FMS1211B",
    "FME1206",
    "FME1202",
    "FME1201",
    "FMS1213B",
    "FMS1209P",
    "FMS1209M",
    "FMS1209C",
    "FMS1215B",
    "FMS1221B",
    "FMS1217B",
    "FMS1223B",
    "FMS1203B",
    "FMS1203C",
    "FMS1203M",
    "FMS1203P",
    "FMS1203S",
    "FMS1201D",
    "FMS1201S",
    "FMS1207P",
    "FMS1207M",
    "FMS1207C",
    "FMS1205S",
    "FMS1205P",
    "FMS1205C",
    "FMS1205M",
    "FMA1205M",
    "FMS1218B",
    "FMA1201L",
    "FMA1201N",
    "FMA1201H",
    "FMA1201J",
    "FMA1201P",
    "FMA1201Q",
    "FMA1201S",
    "FMS1204P",
    "FMS1204M",
    "FMA1203Q",
    "FMA1203H",
    "FMA1203M",
    "FMA1203F",
    "FMS1210B",
    "FMS1210C",
    "FMS1210M",
    "FMS1210P",
    "FMS1212B",
    "FMS1214B",
    "FMS1208P",
    "FMS1208C",
    "FMS1208B",
    "FMS1208M",
    "FMS1216B",
    "FMS1220B",
    "FMS1222B",
    "FMS1211P",
    "FMS1224B",
    "FMS1202M",
    "FMS1202C",
    "FMS1206P",
    "FMS1206C",
    "FMS1204S",
    "FMS1204C",
    "FMS1204B",
    "FMA1204H",
    "FMA1204M",
    "FMC1205",
    "FMC1201",
    "FMC1202",
    "FMC1203",
    "FMS1219B",
]

seriesInternships = [
    "MS3550",
    "SE3550",
    "IEU3550",
    "JS3550",
    "SW3550",
    "GE3550B",
    "GE3550A",
    "PS3550",
    "NM3550",
    "EU3550",
    "ISE3550",
    "INM3550",
]

def parse_cmd_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("data_path", help="The path to the modules.json file.")
    return parser.parse_args()

def add_module(module, db):
    mod_code = module["ModuleCode"]
    if mod_code in mod_exceptions:
        mod_code = mod_exceptions[mod_code]
        module["ModuleCode"] = mod_code
    db[mod_code] = {useful_key: module[useful_key] for useful_key in useful_keys if useful_key in module}

def start_prereq_parsing(db):
    for mod_code in db:
        if "Prerequisite" in db[mod_code]:
            db[mod_code]["Prerequisite"] = modmaven_parser.get_prereq(db[mod_code]["Prerequisite"], mod_code)
            #print db[mod_code]["Prerequisite"]
        if mod_code[:2] == "FM":
            db[mod_code]["Preclusion"] = freshmenSeminars
        elif mod_code.find("3550") != -1:
            db[mod_code]["Preclusion"] = seriesInternships
        elif "Preclusion" in db[mod_code]:
            db[mod_code]["Preclusion"] = modmaven_parser.get_preclusions(db[mod_code]["Preclusion"], mod_code)

def create_modmaven_trees(db):
    for mod_code in db:
        db[mod_code]["ModmavenTree"] = get_tree(mod_code, db)

def is_str_single_mod(string):
    return re.match(modmaven_parser.mod_string + '$', string)

def get_tree(mod_code, db):
    tree = {"name": mod_code, "children": []}
    if mod_code in db and "Prerequisite" in db[mod_code]:
        prereq = db[mod_code]["Prerequisite"]
        if isinstance(prereq, dict):
            tree["children"] += traverse_dict(prereq, db)
        elif prereq and is_str_single_mod(prereq):
            tree["children"].append(get_tree(prereq, db))
    return tree

def traverse_dict(root, db):
    children = []
    items = root.items()
    for entry in items[0][1]:
        if isinstance(entry, dict):
            children += traverse_dict(entry, db)
        else:
            children.append(get_tree(entry, db))
    return [{"name": items[0][0][1:-1], "children": children}]

def generate_locked_mods(db):
    for mod_code in db:
        immediate_mods = get_immediate_mods(db[mod_code]["ModmavenTree"])
        for immediate_mod in immediate_mods:
            if immediate_mod in db:
                if "LockedModules" in db[immediate_mod]:
                    if mod_code not in db[immediate_mod]["LockedModules"]:
                        db[immediate_mod]["LockedModules"].append(mod_code)
                else:
                    db[immediate_mod]["LockedModules"] = [mod_code]

def get_immediate_mods(tree):
    nodes = []
    q=[child for child in tree["children"]]
    while q:
        v=q.pop(0)
        if v["name"] == "or" or v["name"] == "and":
            for child in v["children"]:
                q.append(child)
        else:
            nodes.append(v["name"])
    return nodes

def update_data(db, data):
    for module in data:
        mod_code = module["ModuleCode"]
        module["ModmavenTree"] = db[mod_code]["ModmavenTree"]
        if "Preclusion" in module and db[mod_code]["Preclusion"] != module["Preclusion"]:
            print db[mod_code]["Preclusion"]
        if "Prerequisite" in module and (db[mod_code]["Prerequisite"] != module["Prerequisite"] or is_str_single_mod(module["Prerequisite"])):
            module["ParsedPrerequisite"] = db[mod_code]["Prerequisite"]
        module["LockedModules"] = db[mod_code]["LockedModules"] if "LockedModules" in db[mod_code] else []

def main():
    args = parse_cmd_args()
    data = json.load(open(args.data_path))
    mod_db = {}
    for module in data:
        add_module(module, mod_db)
    start_prereq_parsing(mod_db)
    create_modmaven_trees(mod_db)
    generate_locked_mods(mod_db)
    update_data(mod_db, data)
    with open(args.data_path, "w") as outfile:
        json.dump(data, outfile, indent=4)

if __name__ == '__main__':
        main()
