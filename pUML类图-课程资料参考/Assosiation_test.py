from typing import List, Annotated
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import FewShotPromptTemplate,PromptTemplate
import re
import os

class ClassStructure(BaseModel):
    class_name: str = Field(description="类名称，使用帕斯卡命名法")
    attributes: List[str] = Field(description="私有属性列表，格式：-属性名")
    methods: List[str] = Field(description="公有方法列表，格式：+方法名()")


# 阶段2：类关系建模
class ClassRelationship(BaseModel):
    source_class: str = Field(description="关系发起方类名")
    target_class: str = Field(description="关系接收方类名")
    relation_type: str = Field(description="关系类型，如继承/组合/关联")


class AssociationRelationship(BaseModel):
    assicaiation_name: str = Field(description="关联名称")
    source_class: str = Field(description="关系发起方类名")
    target_class: str = Field(description="关系接收方类名")
    relation_type: str = Field(description="关系类型，默认关联")
    souce_multiplicity: str = Field(description="发起方多重性，如1..*")
    target_multiplicity: str = Field(description="接收方多重性，如1..*")
    source_role: str = Field(description="发起方角色，如user")
    target_role: str = Field(description="接收方角色，如order")
    source_navigation: str = Field(description="发起方的导航属性，如True或False")
    target_navigation: str = Field(description="接收方的导航属性，如True或False")


#  继承关系
class InheritanceRelationship(BaseModel):
    source_class: str = Field(description="继承类名，即子类名")
    target_class: str = Field(description="被继承类名，即父类名")
    relation_type: str = Field(default="继承", description="关系类型，默认为继承")


# 聚合关系
class AggregationRelationship(BaseModel):
    source_class: str = Field(description="聚合类名")
    target_class: str = Field(description="被聚合类名")
    relation_type: str = Field(default="聚合", description="关系类型，默认为聚合")


class CompositionRelationship(BaseModel):
    source_class: str = Field(description="组合类名")
    target_class: str = Field(description="被组合类名")
    relation_type: str = Field(default="组合", description="关系类型，默认为组合")


class DependencyRelationship(BaseModel):
    source_class: str = Field(description="依赖类名")
    target_class: str = Field(description="被依赖类名")
    relation_type: str = Field(default="依赖", description="关系类型，默认为依赖")


# 阶段3：整体架构建模
class ClassDiagram(BaseModel):
    classes: List[ClassStructure] = Field(default_factory=list, description="分析到的类列表")
    association_relationships: List[AssociationRelationship] = Field(default_factory=list, description="类间关联关系列表")
    inheritance_relationships: List[InheritanceRelationship] = Field(default_factory=list, description="类间继承关系列表")
    aggregation_relationships: List[AggregationRelationship] = Field(default_factory=list, description="类间聚合关系列表")
    composition_relationships: List[CompositionRelationship] = Field(default_factory=list, description="类间组合关系列表")
    dependency_relationships: List[DependencyRelationship] = Field(default_factory=list, description="类间依赖关系列表")

# 初始化双解析器
parser = PydanticOutputParser(pydantic_object=ClassDiagram)
format_instructions = parser.get_format_instructions() + """
附加格式要求：
1. 属性格式：-属性名 (如 -id)
2. 方法格式：+方法名() (如 +save())
3. 关联关系描述：使用--箭头，如 User -- Order : 关联
4. 继承关系描述：使用<|--箭头，如 User <|-- Order : 继承
5. 聚合关系描述：使用o--箭头，如 User o-- Order : 聚合
6. 组合关系描述：使用*--箭头，如 User *-- Order : 组合
7. 依赖关系描述：使用..>箭头，如 User ..> Displayer : 依赖

"""
os.environ['OPENAI_API_BASE_URL'] = 'https://api.91ai.me/v1'  # 注意环境变量名称的变更
os.environ['OPENAI_API_KEY'] = '添加密钥................'
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import FewShotPromptTemplate,PromptTemplate
Generalization_of_oneclass_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，

分析待分析的类{class_name}与其他类的集合{classes}中的可能具有的关联关系:
关联关系是指类的对象之间的关系，表示需要对方的服务或保存信息。

例如：教师和学生之间存在教学关联关系，关联名称为教学，关联关系的多重性为：一个教师对应多个学生，一个学生对应多个教师，教师在关联关系中角色名为教学者，学生在关联关系中角色名为求学者。
教师可以找到学生，教师向学生具有导航性。

如作为source_class方的教师对象可以通过该关联找到作为target_class方的学生对象,则target_navigation的值为true，否则为false";
如作为target_class方的学生对象可以通过该关联找到作为source_class方的教师对象,则source_navigation的值为true，否则为false";

注意只分析新添加的类的属性和操作,分析泛化关系，不分析类的其他各种关系。类名，属性名操作名都用汉语表示。如果类已经有某些属性和操作，请不要重复添加。
严格遵循格式：
{format_instructions}


待分析的类{class_name}
待分析的其他类的集合:
{classes}
"""

Generalization_prompt2 = PromptTemplate(
    template=Generalization_of_oneclass_PROMPT_TEMPLATE,
    input_variables=["input","class_name","classes"],
    partial_variables={"format_instructions": format_instructions}
)


def generate_plantuml(classmodel: ClassDiagram) -> str:
    """将实体和关系转换为PlantUML代码"""
    # class_defs = "\n".join([f"class {e.split(':')[0]} {{\n    {e.split(':')[1]}\n}}" for e in entities])
    # relation_defs = "\n".join(relationships)
    # return f"@startuml\n{class_defs}\n{relation_defs}\n@enduml"
    # 转换类结构输出
    print("类结构：")
    print(classmodel)
    class_def = ""
    for cls in classmodel.classes:
        class_def += f"class {cls.class_name} {{\n"
        class_def += "\n".join(cls.attributes) + "\n"
        class_def += "\n".join(cls.methods) + "\n}\n"
        # print(class_def)
    # 转换关系输出
    print("\n类关系：")
    relation_defs = "\n"
    for rel in classmodel.association_relationships:
        print(f"{rel.source_class} --> {rel.target_class} : {rel.relation_type}")
        if rel.source_navigation.lower() == 'true':
            source_navigation = '<'
        else:
            source_navigation = ''
        if rel.target_navigation.lower() == 'true':
            target_navigation = '>'
        else:
            target_navigation = ''
        relation_defs += f'{rel.source_class} "{rel.souce_multiplicity} {rel.source_role}"{source_navigation}--{target_navigation}"{rel.target_multiplicity} {rel.target_role}" {rel.target_class} : {rel.assicaiation_name}\n'
    for rel in classmodel.inheritance_relationships:
        print(f"{rel.source_class} <|-- {rel.target_class} : {rel.relation_type}")
        relation_defs += f"{rel.target_class} <|-- {rel.source_class} : {rel.relation_type}\n"
    for rel in classmodel.aggregation_relationships:
        print(f"{rel.source_class} o-- {rel.target_class} : {rel.relation_type}")
        relation_defs += f"{rel.source_class} o-- {rel.target_class} : {rel.relation_type}\n"
    for rel in classmodel.composition_relationships:
        print(f"{rel.source_class} *-- {rel.target_class} : {rel.relation_type}")
        relation_defs += f"{rel.source_class} *-- {rel.target_class} : {rel.relation_type}\n"
    for rel in classmodel.dependency_relationships:
        print(f"{rel.source_class} ..> {rel.target_class} : {rel.relation_type}")
        relation_defs += f"{rel.source_class} ..> {rel.target_class} : {rel.relation_type}\n"
    return f"@startuml\n{class_def}\n{relation_defs}\n@enduml"

def analyze_text_to_classdiagram(file_path: str) -> ClassDiagram:
  """从plantUML文本中提取类图"""
  with open(file_path, 'r', encoding='utf-8') as file:
      content = file.read()
  #用字符匹配的方式，将content中的类与属性和操作提取出来 ，形成ClassDiagram对象
  class_pattern = r'class\s+([^\s{]+)\s*{\s*([^}]*)\s*}'
  matches = re.findall(class_pattern, content, re.DOTALL)
  result=ClassDiagram()
  for match in matches:
        class_name = match[0].strip()
        body = match[1].strip()
        attributes = []
        methods = []
        for line in body.split('\n'):
            line = line.strip()
            if line.startswith('+') or line.startswith('-') or line.startswith('#'):
                if '(' in line and ')' in line:
                    methods.append(line)
                else:
                    attributes.append(line)
        class_structure = ClassStructure(
            class_name=class_name,
            attributes=attributes,
            methods=methods
        )
        result.classes.append(class_structure)
  #用字符匹配的方式，将content中的继承关系提取出来 ，添加到ClassDiagram
  inheritance_pattern = r'([^\s]+)\s+<\|--\s+([^\s]+)'
  inheritance_matches = re.findall(inheritance_pattern, content)
  for match in inheritance_matches:
        parent_class = match[0].strip()
        child_class = match[1].strip()
        inheritance_relationship = InheritanceRelationship(
            source_class=child_class,
            target_class=parent_class
        )
        result.inheritance_relationships.append(inheritance_relationship)

  #用字符匹配的方式，将content中的关联关系提取出来 ，添加到ClassDiagram 例如：关联这样表示：住院医生 “1 手术执行者” <--> “0..* 手术项目” 手术治疗 : 关联,住院医生 “1 手术执行者” --> “0..* 手术项目” 手术治疗 : 关联
  #association_pattern = r'([^\s]+)\s+"([^"]+)"\s*(<-->|-->|<--)\s*"([^"]+)"\s+([^\s]+)\s*:\s*关联'
  association_pattern = r'([^\s]+)\s+"([^"]+)"\s*(<-->|-->|--|<--)\s*"([^"]+)"\s+([^\s]+)\s*:\s*(.+)'

  association_matches = re.findall(association_pattern, content)

  for match in association_matches:
      print("匹配到关联关系：", match)
      source_class = match[0].strip()
      target_class = match[4].strip()
      source_adds = match[1].strip()
      target_adds = match[3].strip()
      arrow = match[2].strip()
      relation_name = match[5].strip()
      # 提取 source_multiplicity 和 source_role
      souce_multiplicity_match = re.match(r"(\S+)\s", source_adds)
      souce_multiplicity = souce_multiplicity_match.group(1).strip() if souce_multiplicity_match else ""
      source_role_match = re.match(r"\S+\s+(.+)", source_adds)
      source_role = source_role_match.group(1).strip() if source_role_match else ""

      # 提取 target_multiplicity 和 target_role
      target_multiplicity_match = re.match(r"(\S+)\s", target_adds)
      target_multiplicity = target_multiplicity_match.group(1).strip() if target_multiplicity_match else ""
      target_role_match = re.match(r"\S+\s+(.+)", target_adds)
      target_role = target_role_match.group(1).strip() if target_role_match else ""

      # 确定导航属性
      source_navigation = "True" if arrow in ["-->", "<-->"] else "False"
      target_navigation = "True" if arrow in ["<--", "<-->"] else "False"

      # 创建关联关系对象
      association_relationship = AssociationRelationship(
          assicaiation_name = relation_name,
          source_class=source_class,
          target_class=target_class,
          relation_type="关联",
          souce_multiplicity=souce_multiplicity,
          target_multiplicity=target_multiplicity,
          source_role=source_role,
          target_role=target_role,
          source_navigation=source_navigation,
          target_navigation=target_navigation
      )
      result.association_relationships.append(association_relationship)
  return result

if __name__ == "__main__":
    """
    #sample_text = "某供电局准备开发线路监控软件系统，用于各条供电线路的情况。该系统由专职的管理员来操作。每条供电线路安装一个线路检测仪，每30秒采集1次该线路的信息（包括电压、电流）。每隔1小时，线路检测仪通过专线向线路监控软件系统传送该小时的数据，系统接受后，保存在系统中。"
    #从txt文件中读取sample_text
    usecase_file_path = "usecase_model.txt"
    with open("class_input.txt", "r", encoding="utf-8") as f:
        sample_text = f.read()
    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        temperature=0, model="gpt-4-turbo")
    class_diagram_chain = Generalization_prompt2 | llm | parser
    result = class_diagram_chain.invoke({
        "input": sample_text,
        "class_name": "医生",
        "classes": "护士,处方,治疗指令,监测指令"
    })
    print(result)
    print(generate_plantuml(result))
    #保存result到plantUML文件
    filename = "class_model_Association_test.txt"
    output_file = f"{filename}"
    with (open(output_file, "a", encoding="utf-8") as f):  # 以追加模式打开文件
        f.write(generate_plantuml(result))
    """
    filename = "class_model_Association_test.txt"
    output_file = f"{filename}"
    #从plantUML文件中读取类图，形成ClassDiagram对象
    class_diagram = analyze_text_to_classdiagram(output_file)
    print("从plantUML文件中解析得到的类图：")
    print(class_diagram)

    print(generate_plantuml(class_diagram))


