# WAF rules are in preview mode — they log matches without blocking. Promote
# to enforcing per-rule once soak shows acceptable false-positive rates.
locals {
  armor_priority_geo_block          = 5000
  armor_priority_waf_sqli           = 20000
  armor_priority_waf_xss            = 20001
  armor_priority_waf_rce            = 20002
  armor_priority_waf_scanner        = 20003
  armor_priority_waf_session        = 20004
  armor_priority_waf_protocolattack = 20005
  armor_priority_rate_limit         = 30000
  armor_priority_default            = 2147483647

  # Cloud Armor expression length is bounded — chunk countries 5 per rule.
  geo_country_chunks = var.armor_geo_block_enabled ? chunklist(var.armor_geo_block_countries, 5) : []
}

resource "google_compute_security_policy" "armor" {
  name        = "${var.env}-weave-apps-armor"
  description = "Cloud Armor policy for ${var.env}-weave-apps backend services"

  # Enable JSON body parsing so WAF rules inspect request bodies, not just URLs/headers.
  advanced_options_config {
    json_parsing = "STANDARD"
    log_level    = "VERBOSE"
  }

  # ML-based L7 DDoS detection — alert mode by default, generates suggested rules.
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
    }
  }

  dynamic "rule" {
    for_each = local.geo_country_chunks
    content {
      action   = "deny(403)"
      priority = local.armor_priority_geo_block + rule.key
      match {
        expr {
          expression = join(" || ", [for c in rule.value : "origin.region_code == \"${c}\""])
        }
      }
      description = "Geo-block (chunk ${rule.key + 1})"
    }
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_sqli
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sqli-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: SQL Injection (preview)"
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_xss
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('xss-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: Cross-Site Scripting (preview)"
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_rce
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('rce-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: Remote Code Execution (preview)"
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_scanner
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('scannerdetection-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: Scanner Detection (preview)"
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_session
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sessionfixation-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: Session Fixation (preview)"
  }

  rule {
    action   = "deny(403)"
    priority = local.armor_priority_waf_protocolattack
    preview  = true
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('protocolattack-stable', {'sensitivity': 1})"
      }
    }
    description = "WAF: Protocol Attacks (preview)"
  }

  rule {
    action   = "throttle"
    priority = local.armor_priority_rate_limit
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      rate_limit_threshold {
        count        = var.armor_rate_limit_count
        interval_sec = var.armor_rate_limit_interval_sec
      }
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
    }
    description = "Rate limit per IP"
  }

  rule {
    action   = "allow"
    priority = local.armor_priority_default
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow"
  }
}
