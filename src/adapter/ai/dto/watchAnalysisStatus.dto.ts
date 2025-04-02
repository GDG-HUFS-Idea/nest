import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Currency, Region } from 'src/shared/enum/enum'

class MarketTrendItem {
  @IsNumber()
  year!: number

  @IsString()
  volume!: string

  @IsString()
  currency!: Currency

  @IsNumber()
  growth_rate!: number

  @IsUrl()
  source!: string
}

class RevenueSummary {
  @IsNumber()
  amount!: number

  @IsString()
  currency!: Currency

  @IsUrl()
  source!: string
}

class SimilarServiceItem {
  @IsString()
  description!: string

  @IsUrl()
  logo_url!: string

  @IsUrl()
  website_url!: string

  @IsArray()
  @IsString({ each: true })
  tags!: string[]

  @IsString()
  summary!: string
}

class SupportProgram {
  @IsString()
  name!: string

  @IsString()
  organizer!: string

  @IsUrl()
  url!: string

  @IsString()
  start_date!: string

  @IsString()
  end_date!: string
}

class LabelDescription {
  @IsString()
  label!: string

  @IsString()
  description!: string
}

class MarketingStrategyDetail {
  @IsString()
  label!: string

  @IsString()
  description!: string
}

class OpportunityItem {
  @IsString()
  title!: string

  @IsString()
  description!: string
}

class LimitationItem {
  @IsString()
  category!: string

  @IsString()
  detail!: string

  @IsString()
  impact!: string

  @IsString()
  solution!: string
}

class TeamRequirement {
  @IsNumber()
  @IsPositive()
  order!: number

  @IsString()
  role!: string

  @IsArray()
  @IsString({ each: true })
  skills!: string[]

  @IsArray()
  @IsString({ each: true })
  tasks!: string[]

  @IsNumber()
  salary_min!: number

  @IsNumber()
  salary_max!: number

  @IsString()
  currency!: Currency
}

class MarketTrends {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketTrendItem)
  [Region.DOMESTIC]!: MarketTrendItem[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketTrendItem)
  [Region.GLOBAL]!: MarketTrendItem[]
}

class AvgRevenue {
  @IsObject()
  @ValidateNested()
  @Type(() => RevenueSummary)
  [Region.DOMESTIC]!: RevenueSummary;

  @IsObject()
  @ValidateNested()
  @Type(() => RevenueSummary)
  [Region.GLOBAL]!: RevenueSummary
}

class SimilarService {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimilarServiceItem)
  items!: SimilarServiceItem[]
}

class ValueProp {
  @IsString()
  content!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelDescription)
  details!: LabelDescription[]
}

class Revenue {
  @IsString()
  label!: string

  @IsString()
  description!: string

  @IsArray()
  @IsString({ each: true })
  details!: string[]
}

class Investment {
  @IsNumber()
  @IsPositive()
  order!: number

  @IsString()
  section!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelDescription)
  details!: LabelDescription[]
}

class MarketingStrategy {
  @IsString()
  title!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketingStrategyDetail)
  details!: MarketingStrategyDetail[]
}

class Opportunity {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpportunityItem)
  items!: OpportunityItem[]
}

class Limitation {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LimitationItem)
  items!: LimitationItem[]
}

class MarketStats {
  @IsString()
  industry_path!: string

  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number

  @IsObject()
  @ValidateNested()
  @Type(() => MarketTrends)
  market_trends!: MarketTrends

  @IsObject()
  @ValidateNested()
  @Type(() => AvgRevenue)
  avg_revenue!: AvgRevenue
}

class TargetMarket {
  @IsString()
  target!: string

  @IsUrl()
  icon_url!: string

  @IsNumber()
  @IsPositive()
  order!: number

  @IsArray()
  @IsString({ each: true })
  reasons!: string[]

  @IsArray()
  @IsString({ each: true })
  appeal!: string[]

  @IsArray()
  @IsString({ each: true })
  online_activity!: string[]

  @IsArray()
  @IsString({ each: true })
  online_channels!: string[]

  @IsArray()
  @IsString({ each: true })
  offline_channels!: string[]
}

class BusinessModel {
  @IsString()
  summary!: string

  @IsObject()
  @ValidateNested()
  @Type(() => ValueProp)
  value_prop!: ValueProp

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Revenue)
  revenue!: Revenue[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Investment)
  investments!: Investment[]
}

class Result {
  @IsString()
  summary!: string

  @IsString()
  review!: string

  @IsObject()
  @ValidateNested()
  @Type(() => SimilarService)
  similar_service!: SimilarService

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportProgram)
  support_programs!: SupportProgram[]

  @IsObject()
  @ValidateNested()
  @Type(() => MarketStats)
  market_stats!: MarketStats

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetMarket)
  target_markets!: TargetMarket[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketingStrategy)
  marketing_strategies!: MarketingStrategy[]

  @IsObject()
  @ValidateNested()
  @Type(() => BusinessModel)
  business_model!: BusinessModel

  @IsObject()
  @ValidateNested()
  @Type(() => Opportunity)
  opportunity!: Opportunity

  @IsObject()
  @ValidateNested()
  @Type(() => Limitation)
  limitation!: Limitation

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamRequirement)
  team_requirements!: TeamRequirement[]
}

export class WatchAnalysisStatusDto {
  @IsBoolean()
  is_complete!: boolean

  @IsObject()
  @ValidateNested()
  @Type(() => Result)
  @IsOptional()
  result?: Result

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  progress?: number

  @IsString()
  @IsOptional()
  message?: string
}
