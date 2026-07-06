**Named Capturing Groups** `(?<name>pattern)`

Automatically extract meaningful metadata (like region, site type, site ID, and device role) directly from device hostnames, SNMP sysNames, or interface descriptions. This turns static naming conventions into faceted, filterable dimensions within New Relic.

Sample regex tagging patterns:

---

### 1. Retail & Restaurant Chains (Store-Centric)

**Naming Convention:** `[Region]-[City]-[StoreNumber]-[DeviceRole][Number]`
**Sample Device Name:** `NA-CHI-STR0842-RTR01`

**Regex Pattern:**

```regex
^(?<Region>[A-Z]{2})-(?<City>[A-Z]{3})-(?<SiteType>STR)(?<SiteID>\d{4})-(?<DeviceRole>[A-Z]{3})(?<DeviceID>\d{2})$

```

**Extracted Tags:**

* `Region`: NA
* `City`: CHI
* `SiteType`: STR (Store)
* `SiteID`: 0842
* `DeviceRole`: RTR (Router)
* `DeviceID`: 01

---

### 2. Banking & Financial Institutions (Branch & ATM Focus)

**Naming Convention:** `[Country]-[State]-[BranchCode]-[DeviceType]-[Number]`
**Sample Device Name:** `US-TX-BR491-ATM-04`

**Regex Pattern:**

```regex
^(?<Country>[A-Z]{2})-(?<State>[A-Z]{2})-(?<SiteType>BR)(?<BranchID>\d{3})-(?<DeviceType>[A-Z]{3})-(?<DeviceID>\d{2})$

```

**Extracted Tags:**

* `Country`: US
* `State`: TX
* `SiteType`: BR (Branch)
* `BranchID`: 491
* `DeviceType`: ATM
* `DeviceID`: 04

---

### 3. Hospital Systems & Healthcare (Campus & Wing Focus)

**Naming Convention:** `[CampusCode]-[Building/Wing]-[Floor]-[DeviceRole]`
**Sample Device Name:** `MGH-WINGB-FL03-SWCORE`

**Regex Pattern:**

```regex
^(?<Campus>[A-Z0-9]+)-(?<Building>[A-Z]+)-(?<Floor>FL\d{2})-(?<DeviceRole>[A-Z]+)$

```

**Extracted Tags:**

* `Campus`: MGH (Mass General Hospital)
* `Building`: WINGB
* `Floor`: FL03
* `DeviceRole`: SWCORE (Core Switch)

---

### 4. Logistics, Shipping & Manufacturing (Warehouse & Plant Focus)

**Naming Convention:** `[FacilityType]-[AirportCode]-[Zone]-[DeviceType]`
**Sample Device Name:** `WHSE-DFW-ZONE4-WLC02`

**Regex Pattern:**

```regex
^(?<FacilityType>WHSE|PLNT|HUB)-(?<LocationCode>[A-Z]{3})-(?<Zone>ZONE\d+)-(?<DeviceType>[A-Z]{3})(?<DeviceID>\d{2})$

```

**Extracted Tags:**

* `FacilityType`: WHSE (Warehouse)
* `LocationCode`: DFW (Dallas/Fort Worth)
* `Zone`: ZONE4
* `DeviceType`: WLC (Wireless LAN Controller)
* `DeviceID`: 02

---

### 5. Universities & Large Enterprises (Geo-Distributed)

**Naming Convention:** `[Continent]-[Country]-[City]-[Campus]-[DeviceRole]`
**Sample Device Name:** `EU-UK-LON-MAIN-FW01`

**Regex Pattern:**

```regex
^(?<Continent>[A-Z]{2})-(?<Country>[A-Z]{2})-(?<City>[A-Z]{3})-(?<Campus>[A-Z]+)-(?<DeviceRole>[A-Z]{2})(?<DeviceID>\d{2})$

```

**Extracted Tags:**

* `Continent`: EU
* `Country`: UK
* `City`: LON
* `Campus`: MAIN
* `DeviceRole`: FW (Firewall)
* `DeviceID`: 01

---

* **Optional Groups:** Network naming conventions are notoriously imperfect. Use the `?` quantifier for optional capturing groups so the regex doesn't fail entirely if a tech forgets a hyphen. Example: `-(?<Floor>FL\d{2})?-`

* **Catch-Alls for Legacy Gear:** For legacy sites that don't match the new standard try using fallback regexes like `^(?<SiteID>[A-Z0-9]+)-.*` to at least grab the site identifier.