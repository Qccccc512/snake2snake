from typing import List, Annotated
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import re
import os
os.environ['OPENAI_API_BASE_URL'] = 'https://api.91ai.me/v1'  # 注意环境变量名称的变更
os.environ['OPENAI_API_KEY'] = '添加密钥。。。。。。。。。。。。。。。。。。'
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import FewShotPromptTemplate,PromptTemplate
# 阶段1：类结构建模
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
llm = ChatOpenAI(
    openai_api_base=os.environ['OPENAI_API_BASE_URL'],
    openai_api_key=os.environ['OPENAI_API_KEY'],
    temperature=0, model="gpt-4-turbo")
# 示例1
example_1 = {
    "input": """
人员通过显示器上课
""",
    "output": """
类名: Person
属性: -name, -age
方法: +displayInfo()
关联关系: Person --> Course : 关联
依赖关系: Person ..> Displayer : 依赖
"""
}

# 示例2
example_2 = {
    "input": """
书是一种产品
""",
    "output": """
类名: Book
属性: -title, -author
方法: +displayInfo()

类名: Product

继承关系: Product  <|-- Book: 继承
"""
}



# 生成增强格式指令
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
# 构建FewShotPromptTemplate
few_shot_prompt = FewShotPromptTemplate(
    examples=[example_1, example_2],
    example_prompt=PromptTemplate(
        input_variables=["input", "output"],
        template="输入:\n{input}\n输出:\n{output}"

    ),
    prefix="你是非常有经验的软件系统分析师，请从以下需求文本中提取UML类与属性和操作，以及类之间的各种关系,包括继承关系（子类和父类的关系），关联关系，聚合关系，组合关系，依赖关系，形成类图，包括类及其属性方法和类之间的各种关系，注意类的名称和属性名操作名都用汉语，"
           "严格遵循格式：{format_instructions}\n"
           "以上example_1代码中的类有Person和Course，注意定义的类Person和引用的类Course都需要分析出来，Person有name、age属性，包含displayInfo()方法；Person与Course有关联关系。course是Person类与Course类的之间的关联关系的关联角色。Person与Displayer有依赖关系，Person依赖Displayer，其中Person类是依赖类，Displayer是被依赖类。\n"
           "以上example_2代码中的类有Book和Product，注意定义的类Book和引用的类Product都需要分析出来，Book有title, author属性，包含displayInfo()方法；Book与Product有继承关系。Book继承了Product，其中Book类是继承类，Product是被继承类。\n"
    ,
    suffix="待解析文本:\n{input}",
    input_variables=["input"],
    partial_variables={"format_instructions": format_instructions}

)

# 构建双目标提示模板
CLASS_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，请从以下需求文本中提取类，请从以下几方面考虑可能的类：
1.可以从问题领域的角度识别系统内部人员，物品，事件，类型，组织结构，实体等等，
2.不要局限在需求中提到的类,可以结合实现系统责任,发挥自己的想象和推理，自行构造出为实现某一功能系统中的类。
只分析类与类的属性和操作,不分析类的各种关系。类名，属性名操作名都用汉语表示。
严格遵循格式：
{format_instructions}

待解析文本：
{input}
"""

class_prompt = PromptTemplate(
    template=CLASS_PROMPT_TEMPLATE,
    input_variables=["input"],
    partial_variables={"format_instructions": format_instructions}
)

# 构建特征分析链
FEATURE_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，请根据选定的类，结合需求文本的上下文，为选定类的添加特征，包括属性和操作。
属性表示类的状态信息，操作表示类的行为和功能。
注意只分析类的属性和操作,不分析类的各种关系。类名，属性名操作名都用汉语表示。如果类已经有某些属性和操作，请不要重复添加。
严格遵循格式：
{format_instructions}

待解析文本：
{input}
待分析的类:
{class_name}
"""

feture_prompt = PromptTemplate(
    template=FEATURE_PROMPT_TEMPLATE,
    input_variables=["input","class_name"],
    partial_variables={"format_instructions": format_instructions}
)

# 构建泛化关系分析链 Generalization

Generalization_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，请根据待分析的类的集合{classes}，结合需求文本的上下文，分析这些类之间存在的泛化关系。
泛化关系表示类之间的继承关系，即子类和父类的关系。可以从需求中描述的相关类的分类关系，以及类的属性和操作中推断出类之间的继承关系。具体可以从以下几个方面识别：
1.从类的属性和操作中识别待分析的类的集合中类之间可能存在的泛化关系：如果一个类的属性和操作是另一个类的子集，那么可以推断出前者是后者的子类，存在泛化关系。
2.从类的分类关系中识别待分析的类的集合{classes}中的类之间可能存在的泛化关系：如果需求中描述了某些类的分类关系，比如“动物”类可以分为“哺乳动物”和“鸟类”，那么可以推断出“哺乳动物”和“鸟类”是“动物”的子类，存在泛化关系。
3.分别对于类的集合{classes}中的每个类，结合合理的想象和推理，新增待分析的类的父类或子类，并识别待分析的类与其新的父类或子类之间的泛化关系：有些类之间的泛化关系在需求中可能没有明确描述，但可以通过合理的想象和推理来识别，比如“管理员”类和“用户”类都可以看作是“人员”类的子类，存在泛化关系。

注意只分析类的属性和操作,不分析类的各种关系。类名，属性名操作名都用汉语表示。如果类已经有某些属性和操作，请不要重复添加。
严格遵循格式：
{format_instructions}

待解析文本：
{input}

待分析的类的集合:
{classes}
"""
Generalization_of_class1_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，
请结合需求文本的上下文{input}，分析待分析的类{class_name}与其他类的集合{classes}中的可能具有的子类与父类:
例如：如果待分析的类是教师类，其他类集合中有学生类，则可以推理教师类和学生类可以具有共同的父类：用户，于是在新添加新类：用户，并让教师类和学生类继承于用户类。

注意只分析新添加的类的属性和操作,分析泛化关系，不分析类的其他各种关系。类名，属性名操作名都用汉语表示。如果类已经有某些属性和操作，请不要重复添加。
严格遵循格式：
{format_instructions}


待分析的类{class_name}
待分析的其他类的集合:
{classes}
"""
Generalization_of_class2_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，
请结合需求文本的上下文{input}，分析待分析的类{class_name}的可能子类与父类:
例如：如待分析的类是护士类，则可以推理出高级护士类、实习护士类等子类，于是添加新类：高级护士、实习护士，并让高级护士类和实习护士类继承于护士类。

注意只分析新添加的类的属性和操作,分析泛化关系，不分析类的其他各种关系。类名，属性名操作名都用汉语表示。如果类已经有某些属性和操作，请不要重复添加。
严格遵循格式：
{format_instructions}


待分析的类{class_name}
待分析的其他类的集合:
{classes}
"""
Association_of_class_PROMPT_TEMPLATE = """
你是非常有经验的系统分析师，
请结合需求文本的上下文{input}，分析待分析的类{class_name}与其他类的集合{classes}中的可能具有的关联关系:
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


Generalization_prompt = PromptTemplate(
    template=Generalization_PROMPT_TEMPLATE,
    input_variables=["input","classes"],
    partial_variables={"format_instructions": format_instructions}
)
Generalization_prompt1 = PromptTemplate(
    template=Generalization_of_class1_PROMPT_TEMPLATE,
    input_variables=["input","class_name","classes"],
    partial_variables={"format_instructions": format_instructions}
)
Generalization_prompt2 = PromptTemplate(
    template=Generalization_of_class2_PROMPT_TEMPLATE,
    input_variables=["input","class_name","classes"],
    partial_variables={"format_instructions": format_instructions}
)
Association_prompt = PromptTemplate(
    template=Association_of_class_PROMPT_TEMPLATE,
    input_variables=["input","class_name","classes"],
    partial_variables={"format_instructions": format_instructions}
)

# 使用Pydantic定义状态数据模型
class AgentState(BaseModel):
    usecase_file_path:str
    input_text: str
    class_model:ClassDiagram=Field(default_factory=ClassDiagram)
    plantuml_code: str = ""


# 工具函数保持不变...
@tool   #这个装饰器会将函数注册为一个工具，供LangGraph中的状态图使用
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

  #用字符匹配的方式，将content中的关联关系提取出来 ，添加到ClassDiagram 例如：关联这样表示：住院医生 “1 手术执行者” --> “0..* 手术项目” 手术治疗 : 关联

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
      #确定关联名称
      assicaiation_name=source_role+"_"+target_role
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

@tool
def get_classes_from_Actors(file_path: str) -> ClassDiagram:
    """从usecase图参与者文本中提取类名"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # 匹配两种参与者定义格式：
    # 1. "actor 名称" 或 "actor 名称 as 别名"
    # 2. "participant 名称" 或 "participant 名称 as 别名"
    actor_pattern = r'(?:actor|participant)\s+([^\s,\n]+)(?:\s+as\s+[^\s,\n]+)?'
    actors = re.findall(actor_pattern, content, re.IGNORECASE)
    print("参与者列表：/n")
    print(actors)
    result=ClassDiagram()
    #将actors添加到result.classes中
    for actor in actors:
        class_structure = ClassStructure(
            class_name=actor,
            attributes=[],
            methods=[]
        )
        result.classes.append(class_structure)
    #return list(set(actors))  # 去重后返回
    return  result
@tool
def analyze_features(text: str,classmodel: ClassDiagram) -> ClassDiagram:
    """从文本中提取特征作为类的属性和方法"""
    #复制一个classmodel的副本
    result_classmodel=ClassDiagram()
    #result_classmodel.classes=classmodel.classes.copy()
    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        model="gpt-4", temperature=0)
    #对于classmodel.classes中的每个类，添加一些属性和方法
    for cls in classmodel.classes:
        #cls.class_name
        # chain = few_shot_prompt | llm | parser
        chain = feture_prompt | llm | parser
        result = chain.invoke({"input": text, "class_name": cls.class_name})
        target_class = next((c for c in result.classes if c.class_name == cls.class_name), None)
        result_classmodel.classes.append(target_class)
    return  result_classmodel

@tool
def analyze_classes(text: str,classmodel: ClassDiagram) -> ClassDiagram:
    """从文本中提取类名"""
    #显示classmodel中的类
    print("初始类结构：")
    print(classmodel)

    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        model="gpt-4", temperature=0)
    #chain = few_shot_prompt | llm | parser
    chain = class_prompt | llm | parser

    #return chain.invoke({"input": text}).split('\n')
    #return chain.invoke({"input": text}).content.split('\n')
    result=chain.invoke({"input": text})
    print("分析后类结构：")
    print(result)
    #将原来的类结构与新分析的类结构合并，避免重复
    existing_class_names = {cls.class_name for cls in result.classes}
    for old_class in classmodel.classes:
        if old_class.class_name not in existing_class_names:
            result.classes.append(old_class)
    return  result

@tool
def analyze_generalization(text: str,classmodel: ClassDiagram) -> ClassDiagram:
    """分析类之间的泛化关系"""
    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        model="gpt-4", temperature=0)
    #chain = few_shot_prompt | llm | parser
    chain = Generalization_prompt | llm | parser

    #return chain.invoke({"input": text}).split('\n')
    #return chain.invoke({"input": text}).content.split('\n')
    classnames=','.join([cls.class_name for cls in classmodel.classes])
    result=chain.invoke({"input": text,"classes": ','.join([cls.class_name for cls in classmodel.classes])})
    print("待分析泛化关系的类结构：",classnames)
    print(result)
    #将原来的类结构与新分析的类结构合并，避免重复
    existing_class_names = {cls.class_name for cls in classmodel.classes}
    for old_class in classmodel.classes:
    #用old_class中的属性和方法更新result中的类
      target_class = next((c for c in result.classes if c.class_name == old_class.class_name), None)
      if target_class:
        # 合并属性，避免重复
        target_class.attributes = list(set(target_class.attributes + old_class.attributes))
        # 合并方法，避免重复
        target_class.methods = list(set(target_class.methods + old_class.methods))
      else:
        # 如果 result 中没有该类，则直接添加
        result.classes.append(old_class)
    return  result
@tool
def analyze_generalization2(text: str,classmodel: ClassDiagram) -> ClassDiagram:
    """分析类之间的泛化关系"""
    result=ClassDiagram()
    #result复制一个classmodel的副本
    result.classes=classmodel.classes.copy()

    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        model="gpt-4", temperature=0)
    #chain = few_shot_prompt | llm | parser
    chain1 = Generalization_prompt1 | llm | parser
    chain2 = Generalization_prompt2 | llm | parser
    #return chain.invoke({"input": text}).split('\n')
    #return chain.invoke({"input": text}).content.split('\n')
    classnames=','.join([cls.class_name for cls in classmodel.classes])

    print("待分析泛化关系的类结构：",classnames)
    print(result)
    #将原来的类结构与新分析的类结构合并，避免重复
    existing_class_names = {cls.class_name for cls in classmodel.classes}
    for a_cls in classmodel.classes:
    #用old_class中的属性和方法更新result中的类
      print("分析类的各种泛化关系......",a_cls.class_name)
      temp_result1 = chain1.invoke({"input": text,"class_name":  a_cls.class_name, "classes": classnames})
      temp_result2 = chain2.invoke({"input": text, "class_name": a_cls.class_name, "classes": classnames})
      print("分析类的各种泛化关系结果1......",temp_result1)
      print("分析类的各种泛化关系结果2......",temp_result2)
      print("合并类与各种泛化关系......",a_cls.class_name)
      for old_class in temp_result1.classes+temp_result2.classes:
        target_class = next((c for c in result.classes if c.class_name == old_class.class_name), None)
        if target_class:
        # 合并属性，避免重复
           target_class.attributes = list(set(target_class.attributes + old_class.attributes))
        # 合并方法，避免重复
           target_class.methods = list(set(target_class.methods + old_class.methods))
        else:
         # 如果 result 中没有该类，则直接添加
         result.classes.append(old_class)
        # 合并继承关系 ，避免重复
        for inh_rel in temp_result1.inheritance_relationships+temp_result2.inheritance_relationships:
            if inh_rel not in result.inheritance_relationships:
                result.inheritance_relationships.append(inh_rel)

    return  result
@tool
def analyze_associations(text: str,classmodel: ClassDiagram) -> ClassDiagram:
    """分析类之间的关联关系"""
    result=ClassDiagram()
    #result复制一个classmodel的副本
    result.classes=classmodel.classes.copy()
    result.inheritance_relationships=classmodel.inheritance_relationships.copy()
    llm = ChatOpenAI(
        openai_api_base=os.environ['OPENAI_API_BASE_URL'],
        openai_api_key=os.environ['OPENAI_API_KEY'],
        model="gpt-4", temperature=0)
    chain = Association_prompt | llm | parser
    #将原来的类结构与新分析的类结构合并，避免重复
    existing_class_names = {cls.class_name for cls in classmodel.classes}
    for a_cls in classmodel.classes:
        print("分析类的各种关联关系......", a_cls.class_name)
        temp_result = chain.invoke({"input": text, "class_name": a_cls.class_name, "classes": existing_class_names})
        print("分析类的各种关联关系关系结果......",temp_result)
        print("合并类与各种关联关系......", a_cls.class_name)
        for old_class in temp_result.classes :
            target_class = next((c for c in result.classes if c.class_name == old_class.class_name), None)
            if target_class:
                # 合并属性，避免重复
                target_class.attributes = list(set(target_class.attributes + old_class.attributes))
                # 合并方法，避免重复
                target_class.methods = list(set(target_class.methods + old_class.methods))
            else:
                # 如果 result 中没有该类，则直接添加
                result.classes.append(old_class)
            # 合并关系 ，避免重复

            for asso_rel in temp_result.association_relationships:
                if asso_rel not in result.association_relationships:
                    result.association_relationships.append(asso_rel)
    return  result
@tool
def refine_features(classmodel: ClassDiagram) -> ClassDiagram:
      """优化类的属性和方法"""
      # 这里可以添加一些优化逻辑，比如去除子类重复属性
      #对classmodel.inheritance_relationships进行梳理，产生继承表字典
      inheritance_father = {}
      inheritance_son = {}
      define_queue=[]
      for inh_relation in classmodel.inheritance_relationships:
          #将inh_relation.source_class放入inheritance_links
            if inh_relation.source_class not in inheritance_father:
                inheritance_father[inh_relation.source_class] = []
            inheritance_father[inh_relation.source_class].append(inh_relation.target_class)
            if inh_relation.target_class not in inheritance_son:
                inheritance_son[inh_relation.target_class] = []
            inheritance_son[inh_relation.target_class].append(inh_relation.source_class)
      print("inheritance_father:",inheritance_father)
      print("inheritance_son:",inheritance_son)
      #遍历inheritance_son找到处于继承树中叶子节点的类,即没有子类的类
      #分别复制inheritance_son，inheritance_father到新的两个字典
      inheritance_father2 = {}
      inheritance_son2 = {}
      inheritance_father2.update(inheritance_father)
      inheritance_son2.update(inheritance_son)
      print("inheritance_father2:",inheritance_father2)
      print("inheritance_son2:",inheritance_son2)
      print("开始确定继承关系定义顺序......")
      while inheritance_son2:
       #print("inheritance_son2:",inheritance_son2)
       for son_class, father_classes in list(inheritance_father2.items()):
            if son_class not in inheritance_son2 and son_class not in define_queue:
                #将son_class加入queue中
                define_queue.append(son_class)
                print("define_queue:",define_queue)
                del inheritance_father2[son_class]
                print("inheritance_father2:",inheritance_father2)
                for father_class, son_classes in list(inheritance_son2.items()):
                    if son_class in son_classes:
                        son_classes.remove(son_class)
                        if not son_classes:
                            del inheritance_son2[father_class]
                            print("inheritance_son2:",inheritance_son2)
      print("继承关系定义顺序：",define_queue)

       #遍历 inheritance_son中的元素
      for son_class in define_queue:
            #找到classmodel.classes中对应的类
            son_class_structure = next((c for c in classmodel.classes if c.class_name == son_class), None)
            if not son_class_structure:
                continue
            #遍历father_classes
            for father_class in inheritance_father[son_class]:
                father_class_structure = next((c for c in classmodel.classes if c.class_name == father_class), None)
                if not father_class_structure:
                    continue
                #去除son_class_structure中与father_class_structure重复的属性和方法
                son_class_structure.attributes = [attr for attr in son_class_structure.attributes if attr not in father_class_structure.attributes]
                son_class_structure.methods = [meth for meth in son_class_structure.methods if meth not in father_class_structure.methods]
      #子类中删除与父类都有的相同的关联关系
      for son_class in define_queue:
            print("son_class:",son_class)
            #找到classmodel.association_relationships中与son_class相关的关联关系
            for inh_relation in classmodel.association_relationships:
                if inh_relation.source_class == son_class:
                    target_role=inh_relation.target_role
                    target_name=inh_relation.assicaiation_name
                    target_class=inh_relation.target_class
                    for father_classes in inheritance_father[son_class]:
                        for inh_relation2 in classmodel.association_relationships:
                            if inh_relation2.source_class == father_classes and inh_relation2.target_class==target_class and (inh_relation2.target_role==target_role or inh_relation2.assicaiation_name ==target_name ):
                                #删除inh_relation
                                print("inh_relation2:",inh_relation2)
                                print("inh_relation:", inh_relation)
                                print(f"删除子类{son_class}中与父类{father_classes}重复的关联关系_source_class：{inh_relation.source_class} --> {inh_relation.target_class} : {inh_relation.relation_type}")
                                if inh_relation in classmodel.association_relationships:
                                    classmodel.association_relationships.remove(inh_relation)
                                else:
                                    print(f"关联关系未找到，无法删除：{inh_relation}")
                            #找到target_class在classmodle.generaliztion的父类

                if inh_relation.target_class == son_class:
                    source_role=inh_relation.source_role
                    source_name=inh_relation.assicaiation_name
                    source_class=inh_relation.source_class
                    for father_classes in inheritance_father[son_class]:
                        for inh_relation2 in classmodel.association_relationships:
                            if inh_relation2.target_class == father_classes and inh_relation2.source_class==source_class and (inh_relation2.source_role==source_role or inh_relation2.assicaiation_name ==source_name ):
                                #删除inh_relation
                                print("inh_relation2:",inh_relation2)
                                print("inh_relation:", inh_relation)
                                print(f"删除子类{son_class}中与父类{father_classes}重复的关联关系_target_class：{inh_relation.source_class} --> {inh_relation.target_class} : {inh_relation.relation_type}")
                                if inh_relation in classmodel.association_relationships:
                                    classmodel.association_relationships.remove(inh_relation)
                                else:
                                    print(f"关联关系未找到，无法删除：{inh_relation}")
      return classmodel

@tool
def generate_plantuml(classmodel: ClassDiagram) -> str:
        """将实体和关系转换为PlantUML代码"""
        #class_defs = "\n".join([f"class {e.split(':')[0]} {{\n    {e.split(':')[1]}\n}}" for e in entities])
        #relation_defs = "\n".join(relationships)
        #return f"@startuml\n{class_defs}\n{relation_defs}\n@enduml"
        # 转换类结构输出
        print("类结构：")
        print(classmodel)
        class_def = ""
        for cls in classmodel.classes:
            class_def += f"class {cls.class_name} {{\n"
            class_def += "\n".join(cls.attributes) + "\n"
            class_def += "\n".join(cls.methods) + "\n}\n"
            #print(class_def)
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
            relation_defs +=f"{rel.target_class} <|-- {rel.source_class} : {rel.relation_type}\n"
        for rel in classmodel.aggregation_relationships:
            print(f"{rel.source_class} o-- {rel.target_class} : {rel.relation_type}")
            relation_defs +=f"{rel.source_class} o-- {rel.target_class} : {rel.relation_type}\n"
        for rel in classmodel.composition_relationships:
            print(f"{rel.source_class} *-- {rel.target_class} : {rel.relation_type}")
            relation_defs +=f"{rel.source_class} *-- {rel.target_class} : {rel.relation_type}\n"
        for rel in classmodel.dependency_relationships:
            print(f"{rel.source_class} ..> {rel.target_class} : {rel.relation_type}")
            relation_defs +=f"{rel.source_class} ..> {rel.target_class} : {rel.relation_type}\n"
        return f"@startuml\n{class_def}\n{relation_defs}\n@enduml"



def build_workflow():
    workflow = StateGraph(AgentState)
    workflow.add_node("get_classes_from_Actors", lambda state: state.model_copy(
        update={"class_model": get_classes_from_Actors.invoke(state.usecase_file_path)}
    ))
    # 节点定义调整为Pydantic模型兼容方式
    workflow.add_node("analyze_classes", lambda state: state.model_copy(
        update={"class_model": analyze_classes.invoke({
        "text": state.input_text,
        "classmodel": state.class_model
    })}
    ))
    workflow.add_node("analyze_features", lambda state: state.model_copy(
        update={"class_model": analyze_features.invoke({
        "text": state.input_text,
        "classmodel": state.class_model
    })}
    ))
    workflow.add_node("analyze_generalization", lambda state: state.model_copy(
        update={"class_model": analyze_generalization2.invoke({
        "text": state.input_text,
        "classmodel": state.class_model
        })}
     ))
    workflow.add_node("analyze_association", lambda state: state.model_copy(
        update={"class_model": analyze_associations.invoke({
        "text": state.input_text,
        "classmodel": state.class_model
        })}
     ))
    workflow.add_node("generate", lambda state: state.model_copy(
        update={"plantuml_code": generate_plantuml.invoke({
            "classmodel": state.class_model,
        })}
    ))
    workflow.add_node("refine", lambda state: state.model_copy(
        update={"class_model": refine_features.invoke({
            "classmodel": state.class_model
    })}
    ))
    workflow.add_node("final_generate", lambda state: state.model_copy(
        update={"plantuml_code": generate_plantuml.invoke({
            "classmodel": state.class_model,
        })}
    ))
    workflow.add_edge("get_classes_from_Actors", "analyze_classes")
    workflow.add_edge("analyze_classes", "analyze_features")
    workflow.add_edge("analyze_features", "analyze_generalization")
    workflow.add_edge("analyze_generalization", "analyze_association")
    workflow.add_edge("analyze_association", "generate")
    workflow.add_edge("generate", "refine")
    workflow.add_edge("refine", "final_generate")
    workflow.add_edge("final_generate", END)
    workflow.set_entry_point("get_classes_from_Actors")
    return workflow.compile()


def analyze_text_to_plantuml(usecase_path_str:str,text: str) -> str:
    agent = build_workflow()
    result = agent.invoke(AgentState(usecase_file_path=usecase_path_str,input_text=text))
    return AgentState(**result).plantuml_code

if __name__ == "__main__":
    #sample_text = "某供电局准备开发线路监控软件系统，用于各条供电线路的情况。该系统由专职的管理员来操作。每条供电线路安装一个线路检测仪，每30秒采集1次该线路的信息（包括电压、电流）。每隔1小时，线路检测仪通过专线向线路监控软件系统传送该小时的数据，系统接受后，保存在系统中。"
    #从txt文件中读取sample_text
    usecase_file_path = "usecase_model.txt"
    with open("class_input.txt", "r", encoding="utf-8") as f:
        sample_text = f.read()
    #显示sample_text
    print("输入文本:")
    print(sample_text)
    print("生成的PlantUML代码:")
    print(analyze_text_to_plantuml(usecase_file_path,sample_text))
"""
if __name__ == "__main__":
    #从txt文件中读取class_text
    class_file_path = "hospital.txt"
    with open(class_file_path, "r", encoding="utf-8") as f:
        class_text = f.read()
    #显示class_text
    print("输入文本:")
    print(class_text)
    #生成classdiagram对象
    class_diagram = analyze_text_to_classdiagram(class_file_path)
    print("解析得到的类图对象:")
    print(class_diagram)
    if isinstance(class_diagram, ClassDiagram):
        newclass_diagrm=refine_features(class_diagram)
    else:
        raise TypeError("Input to refine_features must be a valid ClassDiagram instance.")
    print(newclass_diagrm)
    print("生成的PlantUML代码:")
    print(generate_plantuml(newclass_diagrm))
"""


